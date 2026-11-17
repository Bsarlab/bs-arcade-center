# =====================================================================
#  Kickoff du midi - agent PC
#  Tourne en arrière-plan (lancé au démarrage de Windows).
#  1. Écoute Rocket League via son API Stats (ws://127.0.0.1:49124).
#  2. À la fin de chaque match, garde le score et les stats de chaque
#     joueur dans %APPDATA%\KickoffDuMidi\matchs.json.
#  3. Sert ces matchs à la page Kickoff sur http://localhost:49125/matchs
#     (uniquement sur ce PC, rien ne sort sur le réseau).
#  État de l'agent : ouvrir http://localhost:49125/etat dans le navigateur.
# =====================================================================
$ErrorActionPreference = 'Continue'
$PortJeu   = 49124   # WebPort du fichier TAStatsAPI.ini
$PortAgent = 49125   # port lu par la page Kickoff
$MaxMatchs = 500

# --- Une seule copie de l'agent à la fois
$mutex = New-Object System.Threading.Mutex($false, 'Local\KickoffDuMidiAgent')
if (-not $mutex.WaitOne(0)) { exit }

$Dossier = Join-Path $env:APPDATA 'KickoffDuMidi'
New-Item -ItemType Directory -Force -Path $Dossier | Out-Null
$Fichier = Join-Path $Dossier 'matchs.json'
$Journal = Join-Path $Dossier 'agent.log'
$Utf8 = New-Object System.Text.UTF8Encoding($false)

function Log([string]$texte) {
  try {
    $ligne = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + '  ' + $texte + "`r`n"
    [System.IO.File]::AppendAllText($Journal, $ligne, $Utf8)
    if ((Get-Item $Journal).Length -gt 512KB) { Remove-Item $Journal -Force }
  } catch {}
}

# --- Historique
$Historique = New-Object System.Collections.ArrayList
if (Test-Path $Fichier) {
  try {
    $lus = [System.IO.File]::ReadAllText($Fichier, $Utf8) | ConvertFrom-Json
    foreach ($m in @($lus)) { if ($m) { [void]$Historique.Add($m) } }
  } catch { Log "Lecture de matchs.json impossible : $_" }
}
function Sauver {
  try {
    $json = ConvertTo-Json -InputObject @($Historique.ToArray()) -Depth 6 -Compress
    if (-not $json) { $json = '[]' }
    $tmp = $Fichier + '.tmp'
    [System.IO.File]::WriteAllText($tmp, $json, $Utf8)
    Move-Item -Force $tmp $Fichier
  } catch { Log "Sauvegarde impossible : $_" }
}
function HistoriqueJson {
  if ($Historique.Count -eq 0) { return '[]' }
  $json = ConvertTo-Json -InputObject @($Historique.ToArray()) -Depth 6 -Compress
  if (-not $json.StartsWith('[')) { $json = '[' + $json + ']' }
  return $json
}

# --- État du match en cours
$script:Jeu = 'deconnecte'
$script:Partie = $null
$script:Joueurs = @()
$script:Guid = ''
$script:DerniereFin = [DateTime]::MinValue

function Nombre($v) { if ($null -eq $v) { return 0 } try { return [int]$v } catch { return 0 } }

function Enregistrer($fin) {
  $g = $script:Partie
  if (-not $g) { return }
  if (([DateTime]::Now - $script:DerniereFin).TotalSeconds -lt 15) { return }
  $guid = [string]$fin.MatchGuid
  if (-not $guid) { $guid = $script:Guid }
  if ($guid) { foreach ($m in $Historique) { if ($m.guid -eq $guid) { return } } }
  $sb = 0; $so = 0
  foreach ($t in @($g.Teams)) {
    if ((Nombre $t.TeamNum) -eq 0) { $sb = Nombre $t.Score } elseif ((Nombre $t.TeamNum) -eq 1) { $so = Nombre $t.Score }
  }
  if ($sb -eq $so) { return }
  $liste = @()
  foreach ($p in @($script:Joueurs)) {
    if (-not $p) { continue }
    $liste += [ordered]@{
      nom = [string]$p.Name; equipe = Nombre $p.TeamNum; score = Nombre $p.Score; buts = Nombre $p.Goals
      tirs = Nombre $p.Shots; passes = Nombre $p.Assists; arrets = Nombre $p.Saves; demos = Nombre $p.Demos
    }
  }
  $playlist = $null
  if ($null -ne $g.PlaylistId) { $playlist = Nombre $g.PlaylistId }
  $m = [pscustomobject][ordered]@{
    guid = $guid; t = [DateTimeOffset]::Now.ToUnixTimeMilliseconds(); playlist = $playlist
    arene = [string]$g.Arena; sb = $sb; so = $so; prolongation = [bool]$g.bOvertime; joueurs = $liste
  }
  $Historique.Insert(0, $m)
  while ($Historique.Count -gt $MaxMatchs) { $Historique.RemoveAt($Historique.Count - 1) }
  $script:DerniereFin = [DateTime]::Now
  Sauver
  Log ("Match enregistré : $sb-$so (mode $playlist, " + $liste.Count + ' joueurs)')
}

function Traiter([string]$texte) {
  try { $msg = $texte | ConvertFrom-Json } catch { return }
  if (-not $msg) { return }
  $d = $msg.Data
  if ($d -is [string]) { try { $d = $d | ConvertFrom-Json } catch {} }
  switch ([string]$msg.Event) {
    'UpdateState' {
      if ($d.Game) {
        if ($d.Game.bReplay) { return }
        $script:Partie = $d.Game
      }
      if ($d.Players) { $script:Joueurs = @($d.Players) }
      if ($d.MatchGuid) { $script:Guid = [string]$d.MatchGuid }
      $script:Jeu = 'en-match'
    }
    'MatchCreated'     { if ($d.MatchGuid) { $script:Guid = [string]$d.MatchGuid }; $script:Jeu = 'en-match' }
    'MatchInitialized' { if ($d.MatchGuid) { $script:Guid = [string]$d.MatchGuid }; $script:Jeu = 'en-match' }
    'MatchEnded'       { Enregistrer $d }
    'MatchDestroyed'   { $script:Partie = $null; $script:Joueurs = @(); $script:Guid = ''; $script:Jeu = 'connecte' }
  }
}

# --- Petit serveur HTTP local pour la page Kickoff
$serveur = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $PortAgent)
try { $serveur.Start() } catch { Log "Port $PortAgent déjà utilisé : $_"; exit }
Log 'Agent démarré'

function Repondre {
  $client = $serveur.AcceptTcpClient()
  try {
    $client.ReceiveTimeout = 2000; $client.SendTimeout = 2000
    $flux = $client.GetStream()
    $lecteur = New-Object System.IO.StreamReader($flux, [System.Text.Encoding]::ASCII, $false, 4096, $true)
    $premiere = $lecteur.ReadLine()
    while ($true) { $l = $lecteur.ReadLine(); if ($null -eq $l -or $l -eq '') { break } }
    if (-not $premiere) { return }
    $morceaux = $premiere.Split(' ')
    $methode = $morceaux[0]; $chemin = if ($morceaux.Length -gt 1) { $morceaux[1] } else { '/' }
    $statut = '200 OK'; $corps = ''
    if ($methode -eq 'OPTIONS') { $statut = '204 No Content' }
    elseif ($chemin.StartsWith('/matchs')) { $corps = HistoriqueJson }
    elseif ($chemin.StartsWith('/etat') -or $chemin -eq '/') {
      $corps = ConvertTo-Json -Compress -InputObject ([ordered]@{ agent = 'kickoff-du-midi'; version = 1; jeu = $script:Jeu; matchs = $Historique.Count; dossier = $Dossier })
    }
    else { $statut = '404 Not Found'; $corps = '{}' }
    $octets = $Utf8.GetBytes($corps)
    $entete = "HTTP/1.1 $statut`r`nContent-Type: application/json; charset=utf-8`r`nContent-Length: " + $octets.Length +
      "`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Methods: GET, OPTIONS`r`nAccess-Control-Allow-Headers: *" +
      "`r`nAccess-Control-Allow-Private-Network: true`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
    $e = [System.Text.Encoding]::ASCII.GetBytes($entete)
    $flux.Write($e, 0, $e.Length)
    if ($octets.Length -gt 0) { $flux.Write($octets, 0, $octets.Length) }
    $flux.Flush()
  } catch { } finally { $client.Close() }
}

# --- Boucle principale
$ws = $null; $reception = $null
$tampon = New-Object byte[] 131072
$morceau = New-Object System.Text.StringBuilder
$prochainEssai = [DateTime]::MinValue
$aucun = [System.Threading.CancellationToken]::None

while ($true) {
  if ($serveur.Pending()) { Repondre; continue }

  if ($null -eq $ws -or $ws.State -ne [System.Net.WebSockets.WebSocketState]::Open) {
    if ($null -ne $ws) {
      try { $ws.Dispose() } catch {}
      $ws = $null; $reception = $null; [void]$morceau.Clear()
      $script:Jeu = 'deconnecte'; Log 'Jeu fermé ou déconnecté'
    }
    if ([DateTime]::Now -ge $prochainEssai) {
      $prochainEssai = [DateTime]::Now.AddSeconds(10)
      $c = New-Object System.Net.WebSockets.ClientWebSocket
      try {
        $t = $c.ConnectAsync([Uri]"ws://127.0.0.1:$PortJeu", $aucun)
        if ($t.Wait(3000) -and $c.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
          $ws = $c; $script:Jeu = 'connecte'; Log 'Connecté à Rocket League'
        } else { $c.Dispose() }
      } catch { try { $c.Dispose() } catch {} }
    }
    Start-Sleep -Milliseconds 150
    continue
  }

  if ($null -eq $reception) {
    $segment = New-Object 'System.ArraySegment[byte]' -ArgumentList @(, $tampon)
    $reception = $ws.ReceiveAsync($segment, $aucun)
  }
  if ($reception.IsCompleted) {
    if ($reception.IsFaulted -or $reception.IsCanceled) { try { $ws.Abort() } catch {}; $reception = $null; continue }
    $r = $reception.Result; $reception = $null
    if ($r.MessageType -eq [System.Net.WebSockets.WebSocketMessageType]::Close) { try { $ws.Abort() } catch {}; continue }
    [void]$morceau.Append($Utf8.GetString($tampon, 0, $r.Count))
    if ($r.EndOfMessage) { $texte = $morceau.ToString(); [void]$morceau.Clear(); Traiter $texte }
    continue
  }
  Start-Sleep -Milliseconds 25
}
