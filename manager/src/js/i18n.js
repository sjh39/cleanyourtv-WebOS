/* The manager app in the TV's language (en, nl, de, fr, es), like the launcher. Rows, banners, help and screens are written in English
   and translated where they are shown: tr() looks the whole text up, then the parts of a text joined by line breaks or " · ", and fills
   in templates ("Launcher %s", "%d photos"). A text without a translation (an error from the service, a version) stays as it is. */
var MLANG = ((window.webOSSystem && window.webOSSystem.locale) || navigator.language || 'en').slice(0, 2);
var MTX = {
  'nl': {
    'Close': 'Sluiten',
    'Back': 'Terug',
    'Cancel': 'Annuleren',
    'On': 'Aan',
    'Off': 'Uit',
    'selected': 'gekozen',
    'default': 'standaard',
    'never': 'nooit',
    'just now': 'zojuist',
    '%d min ago': '%d min geleden',
    '%d h ago': '%d uur geleden',
    '%d days ago': '%d dagen geleden',
    'Launcher %s': 'Launcher %s',
    'Service %s': 'Service %s',
    'Update to %s': 'Bijwerken naar %s',
    'Update to %s (dev build)': 'Bijwerken naar %s (dev-build)',
    'Checking…': 'Controleren…',
    'No release yet': 'Nog geen release',
    'Cannot check': 'Kan niet controleren',
    'Up to date': 'Bijgewerkt',
    'Check for updates': 'Zoeken naar updates',
    'Update channel': 'Updatekanaal',
    'Stable releases': 'Stabiele releases',
    'Dev builds': 'Dev-builds',
    'a release a day at most': 'hooguit één release per dag',
    'every change': 'elke wijziging',
    'build %s': 'build %s',
    'none published right now': 'nu niet gepubliceerd',
    'Go back to launcher %s': 'Terug naar launcher %s',
    'Where updates come from': 'Waar updates vandaan komen',
    'Looking for the dev build…': 'Dev-build zoeken…',
    'Switching…': 'Overschakelen…',
    'Back on the stable releases': 'Terug op de stabiele releases',
    'Following the dev builds. If the Launcher or Service row offers an update, that is the dev build.':
      'De dev-builds worden gevolgd. Als de rij Launcher of Service een update aanbiedt, is dat de dev-build.',
    'Latest release %s': 'Nieuwste release %s',
    'Updates: %s': 'Updates: %s',
    'Launcher %s · service %s': 'Launcher %s · service %s',
    'CleanYourTV as Home': 'CleanYourTV als Home',
    'Live TV': 'Live TV',
    'Wallpapers': 'Wallpapers',
    'Input key': 'Ingangtoets',
    'not available': 'niet beschikbaar',
    'Debloat': 'Debloat',
    '%d of %d on': '%d van %d aan',
    'More': 'Meer',
    'voice, network notifications': 'spraak, netwerkmeldingen',
    'Share log': 'Log delen',
    'QR code for your phone': 'QR-code voor je telefoon',
    'Reset Home customisation': 'Aanpassingen van Home herstellen',
    'Uninstall': 'Verwijderen',
    '%d photos': '%d foto’s',
    'Use CleanYourTV as Home': 'CleanYourTV als Home gebruiken',
    'switching restarts the TV': 'overschakelen herstart de TV',
    'Learn the Home key': 'Home-toets leren',
    'optional': 'optioneel',
    'now: %s': 'nu: %s',
    'not learned': 'niet geleerd',
    'Switch Home?': 'Home wisselen?',
    'Yes, use CleanYourTV as Home': 'Ja, CleanYourTV als Home gebruiken',
    'Yes, use LG’s Home': 'Ja, LG’s Home gebruiken',
    'the TV restarts': 'de TV start opnieuw op',
    'Switching to CleanYourTV… the TV restarts in a moment.': 'Overschakelen naar CleanYourTV… de TV start zo opnieuw op.',
    'Switching to LG’s Home… the TV restarts in a moment.': 'Overschakelen naar LG’s Home… de TV start zo opnieuw op.',
    'Remove CleanYourTV?': 'CleanYourTV verwijderen?',
    'Yes, remove CleanYourTV': 'Ja, CleanYourTV verwijderen',
    'settings and apps are deleted; the TV restarts': 'instellingen en apps worden verwijderd; de TV start opnieuw op',
    'Removing CleanYourTV… the TV restarts in a moment and LG’s Home comes back.':
      'CleanYourTV wordt verwijderd… de TV start zo opnieuw op en LG’s Home komt terug.',
    'Yes, reset Home': 'Ja, Home herstellen',
    'dock, top buttons, hidden apps, app order and clock go back to the defaults':
      'dock, knoppen bovenaan, verborgen apps, volgorde en klok gaan terug naar de standaard',
    'Home is back to the defaults. Open Home to see it.': 'Home staat weer op de standaard. Open Home om het te zien.',
    'Live TV: your own playlist': 'Live TV: je eigen afspeellijst',
    'Show Live TV': 'Live TV tonen',
    'Playlist': 'Afspeellijst',
    '%d channels': '%d zenders',
    'guide for %d programmes': 'gids voor %d programma’s',
    'not set': 'niet ingesteld',
    'set up from your phone': 'instellen met je telefoon',
    'Refresh playlist and guide': 'Afspeellijst en gids vernieuwen',
    'Refreshing…': 'Vernieuwen…',
    'Refreshing in the background': 'Wordt op de achtergrond vernieuwd',
    'Learn the Guide key': 'Gidstoets leren',
    'LG’s guide stays': 'LG’s gids blijft',
    'Live TV is off': 'Live TV staat uit',
    'Clear recent channels': 'Recente zenders wissen',
    'Recent channels cleared': 'Recente zenders gewist',
    'Remove the playlist': 'Afspeellijst verwijderen',
    'nothing to remove': 'niets te verwijderen',
    'Remove the playlist?': 'Afspeellijst verwijderen?',
    'Yes, remove the playlist': 'Ja, afspeellijst verwijderen',
    'the address, the channel list, the guide and your favourites are deleted':
      'het adres, de zenderlijst, de gids en je favorieten worden verwijderd',
    'No, keep it': 'Nee, bewaren',
    'Playlist removed': 'Afspeellijst verwijderd',
    'Playlist saved': 'Afspeellijst opgeslagen',
    'Input key opens our Inputs list': 'Ingangtoets opent onze ingangenlijst',
    'not available on this firmware': 'niet beschikbaar op deze firmware',
    'Learn the Input key': 'Ingangtoets leren',
    'default (%s)': 'standaard (%s)',
    'learned: %s': 'geleerd: %s',
    'Input key shows': 'Ingangtoets toont',
    'over the running app, ready in the background (instant)': 'over de lopende app, klaar op de achtergrond (direct)',
    'over the running app, started when pressed': 'over de lopende app, gestart bij indrukken',
    'the launcher’s Inputs list': 'de ingangenlijst van de launcher',
    'LG’s own list: CleanYourTV is not the Home': 'LG’s eigen lijst: CleanYourTV is niet de Home',
    'Ads': 'Advertenties',
    'Viewing tracking (LivePlus)': 'Kijkgedrag volgen (LivePlus)',
    'Telemetry logs': 'Telemetrielogs',
    'Suggestions and nudges': 'Suggesties en duwtjes',
    'ad services and ad servers': 'advertentiediensten en -servers',
    'Switch all on': 'Alles aanzetten',
    'Switch all off': 'Alles uitzetten',
    'Debloat LG’s ads and telemetry': 'Advertenties en telemetrie van LG verwijderen',
    'Voice': 'Spraak',
    'not installed': 'niet geïnstalleerd',
    'Network notifications': 'Netwerkmeldingen',
    'Install voice': 'Spraak installeren',
    'installing…': 'installeren…',
    'downloads about 80 MB': 'downloadt ongeveer 80 MB',
    'Listen on the voice button': 'Luisteren op de spraakknop',
    'learn a button first': 'leer eerst een knop',
    'Learn the voice button': 'Spraakknop leren',
    'Try it now': 'Nu proberen',
    'listening…': 'luisteren…',
    'speak when the card appears': 'spreek als de kaart verschijnt',
    'Speak now…': 'Spreek nu…',
    'Listening…': 'Luisteren…',
    'Switch off LG’s voice assistant': 'LG’s spraakassistent uitzetten',
    'not paused yet': 'nog niet gepauzeerd',
    'Home Assistant (Assist)': 'Home Assistant (Assist)',
    'Which answers first': 'Wat antwoordt eerst',
    'Home Assistant first, then the AI': 'Eerst Home Assistant, dan de AI',
    'Home Assistant only': 'Alleen Home Assistant',
    'The AI only': 'Alleen de AI',
    'Assist agent': 'Assist-agent',
    'set up Home Assistant first': 'stel eerst Home Assistant in',
    'AI chat (OpenRouter)': 'AI-chat (OpenRouter)',
    'no key set': 'geen sleutel ingesteld',
    'Model': 'Model',
    'Send the text to': 'Tekst sturen naar',
    'not set · shows a card only': 'niet ingesteld · toont alleen een kaart',
    'Set up from your phone': 'Instellen met je telefoon',
    'key, model, Home Assistant, server': 'sleutel, model, Home Assistant, server',
    'Set up with commands': 'Instellen met commando’s',
    'for scripts and ssh': 'voor scripts en ssh',
    'Forget the conversation': 'Gesprek vergeten',
    'Conversation cleared': 'Gesprek gewist',
    'Remove voice': 'Spraak verwijderen',
    'deletes the %d MB download': 'verwijdert de download van %d MB',
    'Voice removed': 'Spraak verwijderd',
    'Default agent': 'Standaardagent',
    'Home Assistant’s own': 'die van Home Assistant',
    'Choose the model that answers': 'Kies het model dat antwoordt',
    'Choose the Home Assistant agent': 'Kies de Home Assistant-agent',
    'Loading the model list…': 'Modellenlijst laden…',
    'Asking Home Assistant…': 'Home Assistant vragen…',
    'Connected to %s': 'Verbonden met %s',
    'Agent: %s': 'Agent: %s',
    'Model: %s': 'Model: %s',
    'Saved': 'Opgeslagen',
    'Voice · %s': 'Spraak · %s',
    'Last heard: “%s”': 'Laatst gehoord: ‘%s’',
    'Last try: %s': 'Laatste poging: %s',
    'Accept notifications from the network': 'Meldingen van het netwerk accepteren',
    'How to send': 'Hoe te versturen',
    'address, token, example': 'adres, token, voorbeeld',
    'Show as QR code': 'Als QR-code tonen',
    'scan with a phone to copy the address and token': 'scan met een telefoon om adres en token te kopiëren',
    'New token': 'Nieuw token',
    'the old one stops working': 'het oude werkt niet meer',
    'New token created. Open “How to send” to see it.': 'Nieuw token gemaakt. Open ‘Hoe te versturen’ om het te zien.',
    'Switch notifications on first': 'Zet eerst meldingen aan',
    'Manage from your phone': 'Beheren met je telefoon',
    'upload photos, configure Immich': 'foto’s uploaden, Immich instellen',
    'Local uploads': 'Lokale uploads',
    'Immich': 'Immich',
    'not connected': 'niet verbonden',
    'syncing… %d new': 'synchroniseren… %d nieuw',
    'synced %s': 'gesynchroniseerd %s',
    'Total': 'Totaal',
    '%d of 150 MB': '%d van 150 MB',
    'Sync now': 'Nu synchroniseren',
    'syncing…': 'synchroniseren…',
    'Immich: new and changed photos': 'Immich: nieuwe en gewijzigde foto’s',
    'connect Immich first': 'verbind eerst Immich',
    'Syncing with Immich…': 'Synchroniseren met Immich…',
    'Picture size': 'Fotogrootte',
    'Full HD (1920 px)': 'Full HD (1920 px)',
    '4K (3840 px)': '4K (3840 px)',
    'Remove all uploads': 'Alle uploads verwijderen',
    'Disconnect Immich': 'Immich loskoppelen',
    'Yes, remove all uploads': 'Ja, alle uploads verwijderen',
    'Yes, disconnect Immich': 'Ja, Immich loskoppelen',
    'the uploaded photos are deleted from the TV': 'de geüploade foto’s worden van de TV verwijderd',
    'the key is forgotten and its photos are deleted from the TV': 'de sleutel wordt vergeten en de foto’s worden van de TV verwijderd',
    'Uploads removed': 'Uploads verwijderd',
    'Immich disconnected': 'Immich losgekoppeld',
    'Take over the Input key': 'Ingangtoets overnemen',
    'Set up now': 'Nu instellen',
    'the screen blinks once': 'het scherm knippert één keer',
    'Set up anyway': 'Toch instellen',
    'untested firmware; a failed start restarts the TV': 'ongeteste firmware; een mislukte start herstart de TV',
    'works without the service': 'werkt zonder de service',
    'recommended first · installed %s': 'eerst aanbevolen · geïnstalleerd %s',
    'The service is not running. Set it up to replace LG’s Home, take over the Input key and keep everything up to date.':
      'De service draait niet. Stel hem in om LG’s Home te vervangen, de ingangtoets over te nemen en alles bij te werken.',
    'Checking for updates…': 'Zoeken naar updates…',
    'Could not check: %s': 'Kan niet controleren: %s',
    'no answer': 'geen antwoord',
    'Updating to %s…': 'Bijwerken naar %s…',
    'Update failed: %s': 'Bijwerken mislukt: %s',
    'The update is taking too long. Log: /tmp/cytv-selfupdate.log on the TV.':
      'De update duurt te lang. Log: /tmp/cytv-selfupdate.log op de TV.',
    'Updating… %s': 'Bijwerken… %s',
    'Setting up… the screen blinks once while LG’s system restarts':
      'Instellen… het scherm knippert één keer terwijl LG’s systeem herstart',
    'Setting up… %s': 'Instellen… %s',
    'Waiting for the service…': 'Wachten op de service…',
    'The service did not answer': 'De service antwoordde niet',
    'The service did not answer.': 'De service antwoordde niet.',
    'Reading status…': 'Status lezen…',
    'Preparing…': 'Voorbereiden…',
    'Share the log': 'Log delen',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Tap <b>Copy</b> on the page and paste it into your message.</li>':
      '<li>Telefoon op <b>hetzelfde wifi-netwerk</b> als de TV.</li><li>Scan de code met de camera.</li><li>Tik op de pagina op <b>Kopiëren</b> en plak het in je bericht.</li>',
    'Preparing the report…': 'Rapport voorbereiden…',
    'The page is open for ten minutes. It lists versions, the setup log and the service log; addresses and URL paths are masked.':
      'De pagina is tien minuten open. Hij toont versies, het installatielog en het servicelog; adressen en URL-paden zijn verborgen.',
    'Could not prepare the report (is the Homebrew Channel installed?).':
      'Kan het rapport niet voorbereiden (is het Homebrew Channel geïnstalleerd?).',
    'Notification address and token': 'Meldingsadres en token',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera and open the page: it shows the address and the token with <b>Copy</b> buttons.</li><li>The token is a <b>secret</b>: anyone who sees this code while it is open can read it.</li>':
      '<li>Telefoon op <b>hetzelfde wifi-netwerk</b> als de TV.</li><li>Scan de code met de camera en open de pagina: die toont het adres en het token met <b>Kopiëren</b>-knoppen.</li><li>Het token is <b>geheim</b>: iedereen die deze code ziet terwijl hij open is, kan het lezen.</li>',
    'The notification listener is not running.': 'De meldingenluisteraar draait niet.',
    'The page opens for ten minutes. It is not encrypted: the token travels over your Wi-Fi, so use a network you trust.':
      'De pagina is tien minuten open. Hij is niet versleuteld: het token gaat over je wifi, dus gebruik een netwerk dat je vertrouwt.',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Choose <b>Upload photos</b> or <b>Configure Immich</b>.</li>':
      '<li>Telefoon op <b>hetzelfde wifi-netwerk</b> als de TV.</li><li>Scan de code met de camera.</li><li>Kies <b>Upload photos</b> of <b>Configure Immich</b>.</li>',
    'The page stays open while you use it, at most an hour. It is not encrypted: your photos and the Immich key travel over your Wi-Fi.':
      'De pagina blijft open zolang je hem gebruikt, hooguit een uur. Hij is niet versleuteld: je foto’s en de Immich-sleutel gaan over je wifi.',
    'Set up Live TV': 'Live TV instellen',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Enter the <b>code</b> below and your playlist address.</li>':
      '<li>Telefoon op <b>hetzelfde wifi-netwerk</b> als de TV.</li><li>Scan de code met de camera.</li><li>Vul de <b>code</b> hieronder en het adres van je afspeellijst in.</li>',
    'The page stays open for ten minutes. It is not encrypted: the playlist address, which may hold an access key, travels over your Wi-Fi.':
      'De pagina blijft tien minuten open. Hij is niet versleuteld: het adres van de afspeellijst, waarin een toegangssleutel kan zitten, gaat over je wifi.',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Enter your <b>OpenRouter key</b> and model, or your <b>Home Assistant</b> address and access token, and tap <b>Save</b>.</li>':
      '<li>Telefoon op <b>hetzelfde wifi-netwerk</b> als de TV.</li><li>Scan de code met de camera.</li><li>Vul je <b>OpenRouter-sleutel</b> en model in, of het adres en toegangstoken van <b>Home Assistant</b>, en tik op <b>Save</b>.</li>',
    'The page stays open for ten minutes, or until you save. It is not encrypted: the key travels over your Wi-Fi, so use a network you trust.':
      'De pagina blijft tien minuten open, of tot je opslaat. Hij is niet versleuteld: de sleutel gaat over je wifi, dus gebruik een netwerk dat je vertrouwt.',
    'The page has closed. Close this and try again.': 'De pagina is gesloten. Sluit dit en probeer het opnieuw.',
    '%s   code %s': '%s   code %s',
    'Start': 'Start',
    'Skip': 'Overslaan',
    'Clear': 'Wissen',
    'default: %s': 'standaard: %s',
    'back to the default (241)': 'terug naar de standaard (241)',
    'forget the code': 'code vergeten',
    'LG’s guide again': 'weer LG’s gids',
    'The Input key.\nChoose Start, then press the Input button on your remote.':
      'De ingangtoets.\nKies Start en druk dan op de Input-knop van je afstandsbediening.',
    'The Home key (optional).\nChoose Start, then press the Home button on your remote.':
      'De Home-toets (optioneel).\nKies Start en druk dan op de Home-knop van je afstandsbediening.',
    'The voice button.\nChoose Start, then press the button you want to use for voice. The remote’s microphone button may not reach the hook; any spare button works.':
      'De spraakknop.\nKies Start en druk dan op de knop die je voor spraak wilt gebruiken. De microfoonknop bereikt de hook misschien niet; elke vrije knop werkt.',
    'The Guide key.\nChoose Start, then press the Guide button on your remote. It then opens the Live TV channel guide instead of LG’s guide. Clear it to get LG’s guide back.':
      'De gidstoets.\nKies Start en druk dan op de Guide-knop van je afstandsbediening. Die opent daarna de Live TV-gids in plaats van LG’s gids. Wis hem om LG’s gids terug te krijgen.',
    'Done.\nInput key %s.\nThe Home key is optional: learn it from the main list if you want it recorded.':
      'Klaar.\nIngangtoets %s.\nDe Home-toets is optioneel: leer hem via de hoofdlijst als je hem wilt vastleggen.',
    'Input key cleared.\nIt uses the default code (%s).': 'Ingangtoets gewist.\nHij gebruikt de standaardcode (%s).',
    'Voice button cleared.': 'Spraakknop gewist.',
    'Guide key cleared. LG’s guide is back.': 'Gidstoets gewist. LG’s gids is terug.',
    'Home key cleared.': 'Home-toets gewist.',
    'Press the %s button now…': 'Druk nu op de %s-knop…',
    '%s key learned: code %s.': '%s-toets geleerd: code %s.',
    'Continue to the test': 'Door naar de test',
    'The hook did not attach on this firmware, so keys cannot be learned. The Input key stays with LG’s picker.\nUse Share log to report this.':
      'De hook koppelde niet op deze firmware, dus toetsen kunnen niet geleerd worden. De ingangtoets blijft bij LG’s kiezer.\nMeld dit via Log delen.',
    'Nothing was pressed.': 'Er is niets ingedrukt.',
    'Try again': 'Opnieuw proberen',
    'Test.\nPress the Input button once more. Our Inputs list should open over this screen.':
      'Test.\nDruk nog een keer op de Input-knop. Onze ingangenlijst hoort over dit scherm te openen.',
    'The Inputs list opened: the Input key works.': 'De ingangenlijst opende: de ingangtoets werkt.',
    'Continue': 'Doorgaan',
    'The Inputs list did not open.\nIf LG’s own picker showed, the Input key is not mapped: learn it again or switch the Input key off.':
      'De ingangenlijst opende niet.\nAls LG’s eigen kiezer verscheen, is de ingangtoets niet gekoppeld: leer hem opnieuw of zet de ingangtoets uit.',
    'Learn again': 'Opnieuw leren',
    'Input': 'Input',
    'Home': 'Home',
    'Guide': 'Guide',
    'voice': 'spraak',
    'The home screen you see. Updates come from GitHub releases and are checked against a SHA-256 file before they are installed. If a new launcher does not start, the previous one is put back.':
      'Het startscherm dat je ziet. Updates komen van GitHub-releases en worden gecontroleerd met een SHA-256-bestand voor ze worden geïnstalleerd. Start een nieuwe launcher niet, dan komt de vorige terug.',
    'The background service behind the launcher: Live TV, picture notifications, the Input key, these updates. A failed update restores the previous files.':
      'De achtergronddienst achter de launcher: Live TV, fotomeldingen, de ingangtoets, deze updates. Een mislukte update zet de vorige bestanden terug.',
    'Looks for a newer release on GitHub. Nothing is installed until you choose an update.':
      'Zoekt een nieuwere release op GitHub. Er wordt niets geïnstalleerd tot je een update kiest.',
    'Stable releases are what most people want: at most one a day, made from the dev builds. Dev builds come with every change and can be less finished; choose Dev here, then use the Launcher and Service rows to install it. Going back to Stable offers the latest release again.':
      'Stabiele releases zijn wat de meeste mensen willen: hooguit één per dag, gemaakt van de dev-builds. Dev-builds komen met elke wijziging en kunnen minder af zijn; kies hier Dev en installeer met de rijen Launcher en Service. Terug naar Stabiel biedt weer de nieuwste release aan.',
    'Swaps the previous launcher version back in. The newer one stays available as an update.':
      'Zet de vorige launcherversie terug. De nieuwere blijft beschikbaar als update.',
    'Whether this launcher is Home, and learning the Home key.': 'Of deze launcher de Home is, en het leren van de Home-toets.',
    'Stops LG’s ad, recommendation and telemetry services and blocks a few ad servers. Nothing is uninstalled, and it only applies while this launcher is Home.':
      'Stopt de advertentie-, aanbevelings- en telemetriediensten van LG en blokkeert een paar advertentieservers. Er wordt niets verwijderd, en het geldt alleen zolang deze launcher Home is.',
    'Stops LG’s ad, tracking, telemetry and suggestion services, in four groups you can switch separately. Nothing is uninstalled, and it only applies while this launcher is Home.':
      'Stopt de advertentie-, volg-, telemetrie- en suggestiediensten van LG, in vier groepen die je los kunt schakelen. Er wordt niets verwijderd, en het geldt alleen zolang deze launcher Home is.',
    'Keeps admanager and adoverlay-service from starting and points three LG ad servers at nothing in /etc/hosts.':
      'Houdt admanager en adoverlay-service tegen bij het starten en laat drie advertentieservers van LG in /etc/hosts nergens heen wijzen.',
    'Keeps acr2 from starting: the service that recognises what is on screen (LG calls it LivePlus) and reports it.':
      'Houdt acr2 tegen bij het starten: de dienst die herkent wat er op het scherm is (LG noemt het LivePlus) en dat doorgeeft.',
    'Stops remotelogger and service-logger, which collect logs and send them to LG.':
      'Stopt remotelogger en service-logger, die logs verzamelen en naar LG sturen.',
    'Stops contentminer and nudge (recommendations and pop-up tips) and keeps sportsalarm from starting.':
      'Stopt contentminer en nudge (aanbevelingen en pop-uptips) en houdt sportsalarm tegen bij het starten.',
    'Switches every group on.': 'Zet elke groep aan.',
    'Switches the debloat off: the services start again and the hosts lines are removed.':
      'Zet de debloat uit: de diensten starten weer en de hosts-regels worden verwijderd.',
    'Voice and network notifications.': 'Spraak en netwerkmeldingen.',
    'Your own photos behind Home: uploaded from a phone, or synced from Immich albums. Switch them on in the launcher: Customise > Wallpapers.':
      'Je eigen foto’s achter Home: geüpload met een telefoon of gesynchroniseerd uit Immich-albums. Zet ze aan in de launcher: Aanpassen > Wallpapers.',
    'Shows a QR code. On the phone page you upload photos (they are made the right size on the phone), delete uploads, connect Immich, choose albums and hide single photos.':
      'Toont een QR-code. Op de telefoonpagina upload je foto’s (die op de telefoon de juiste grootte krijgen), verwijder je uploads, verbind je Immich, kies je albums en verberg je losse foto’s.',
    'Photos uploaded from a phone, kept on the TV. At most 100.': 'Foto’s geüpload met een telefoon, bewaard op de TV. Hooguit 100.',
    'Photos from the Immich albums you chose, downloaded to the TV every six hours (and with Sync now), so Home never waits for Immich. At most 300.':
      'Foto’s uit de Immich-albums die je koos, elke zes uur naar de TV gedownload (en met Nu synchroniseren), zodat Home nooit op Immich wacht. Hooguit 300.',
    'Every photo Wallpapers can show, and the space they use on the TV (at most 150 MB).':
      'Elke foto die Wallpapers kan tonen, en de ruimte die ze op de TV gebruiken (hooguit 150 MB).',
    'Downloads new and changed photos from the chosen albums now and removes the ones that left them.':
      'Downloadt nu nieuwe en gewijzigde foto’s uit de gekozen albums en verwijdert de foto’s die eruit zijn gegaan.',
    'Deletes every uploaded photo from the TV. Immich photos stay.': 'Verwijdert elke geüploade foto van de TV. Immich-foto’s blijven.',
    'Forgets the address and the key and deletes the Immich photos from the TV. Uploads stay.':
      'Vergeet het adres en de sleutel en verwijdert de Immich-foto’s van de TV. Uploads blijven.',
    'Puts the dock, the top buttons, hidden apps, the app order and the clock back to the defaults. The theme stays.':
      'Zet het dock, de knoppen bovenaan, verborgen apps, de volgorde en de klok terug naar de standaard. Het thema blijft.',
    'The launcher’s own settings go back to the defaults. Apps, the theme and everything in this app stay.':
      'De eigen instellingen van de launcher gaan terug naar de standaard. Apps, het thema en alles in deze app blijven.',
    'On: the Home button opens this launcher. Off: LG’s own Home. Switching restarts the TV (about a minute); the service keeps running either way.':
      'Aan: de Home-knop opent deze launcher. Uit: LG’s eigen Home. Wisselen herstart de TV (ongeveer een minuut); de service blijft hoe dan ook draaien.',
    'Lets other devices on your network send picture notifications to this TV with a POST request and a secret token. Off by default.':
      'Laat andere apparaten in je netwerk fotomeldingen naar deze TV sturen met een POST-verzoek en een geheim token. Standaard uit.',
    'On: the TV listens on port 8767 for POST /notify with the token. Anyone who has the token and network access can show cards on this screen.':
      'Aan: de TV luistert op poort 8767 naar POST /notify met het token. Iedereen met het token en toegang tot het netwerk kan kaarten op dit scherm tonen.',
    'Shows the address, the token and an example request.': 'Toont het adres, het token en een voorbeeldverzoek.',
    'Shows a QR code. A phone that scans it opens a page, served by the TV for ten minutes, that shows the notification address and the token with Copy buttons (for Home Assistant, for example). The token is a secret.':
      'Toont een QR-code. Een telefoon die hem scant, opent een pagina die de TV tien minuten aanbiedt, met het meldingsadres en het token en Kopiëren-knoppen (bijvoorbeeld voor Home Assistant). Het token is geheim.',
    'Creates a new secret token. Devices using the old one stop working.':
      'Maakt een nieuw geheim token. Apparaten met het oude werken niet meer.',
    'Optional. Speak into the remote and the TV turns it into text on the TV itself (Moonshine, English). The text can be sent to a server you run. Audio never leaves the TV. Needs a download of about 80 MB.':
      'Optioneel. Spreek in de afstandsbediening en de TV zet het op de TV zelf om in tekst (Moonshine, Engels). De tekst kan naar een server van jou. Audio verlaat de TV nooit. Vraagt een download van ongeveer 80 MB.',
    'Downloads the speech engine, a 64-bit C library and the model (checksums are verified), then tests them. About a minute. Nothing is installed in the system folders.':
      'Downloadt de spraakengine, een 64-bit C-bibliotheek en het model (controlesommen worden gecontroleerd) en test ze. Ongeveer een minuut. Er wordt niets in de systeemmappen geïnstalleerd.',
    'On: pressing the button you learned starts listening. A card shows what was heard.':
      'Aan: de geleerde knop indrukken start het luisteren. Een kaart toont wat er gehoord is.',
    'On: what you say is also sent as text to a language model through OpenRouter and the answer is shown on screen. Needs your OpenRouter key; the text goes to OpenRouter and the model provider, never audio.':
      'Aan: wat je zegt, gaat ook als tekst naar een taalmodel via OpenRouter en het antwoord verschijnt op het scherm. Vraagt je OpenRouter-sleutel; de tekst gaat naar OpenRouter en de modelaanbieder, nooit audio.',
    'Shows a QR code. Scan it with a phone on the same Wi-Fi to enter your OpenRouter key, choose a model, write instructions and set a server address. Nothing is typed on the TV.':
      'Toont een QR-code. Scan hem met een telefoon op hetzelfde wifi-netwerk om je OpenRouter-sleutel in te vullen, een model te kiezen, instructies te schrijven en een serveradres in te stellen. Er wordt niets op de TV getypt.',
    'Choose the model that answers. The list is read from OpenRouter: the newest models of the main providers, with the price per million words in. The phone page lists every model.':
      'Kies het model dat antwoordt. De lijst komt van OpenRouter: de nieuwste modellen van de grote aanbieders, met de prijs per miljoen woorden invoer. De telefoonpagina toont elk model.',
    'Shows the commands to set the key, model and instructions from a shell, and how to ask by text.':
      'Toont de commando’s om sleutel, model en instructies vanuit een shell in te stellen, en hoe je met tekst iets vraagt.',
    'The AI and Home Assistant remember the last turns for ten minutes. This clears them.':
      'De AI en Home Assistant onthouden de laatste beurten tien minuten. Dit wist ze.',
    'Sends what you say as text to Home Assistant’s Assist and shows its answer. Needs the address and a long-lived access token (Home Assistant profile page), entered on your phone. Choosing this row tests the connection.':
      'Stuurt wat je zegt als tekst naar Assist van Home Assistant en toont het antwoord. Vraagt het adres en een langlevend toegangstoken (profielpagina van Home Assistant), ingevuld op je telefoon. Deze rij kiezen test de verbinding.',
    'Home Assistant first, then the AI: Assist gets the text; if it does not understand, the AI answers. Home Assistant only: never the AI. The AI only: Home Assistant is not asked. Choose to switch.':
      'Eerst Home Assistant, dan de AI: Assist krijgt de tekst; begrijpt het die niet, dan antwoordt de AI. Alleen Home Assistant: nooit de AI. Alleen de AI: Home Assistant wordt niet gevraagd. Kies om te wisselen.',
    'Which Home Assistant conversation agent answers. The default is the built-in one; others (for example a language-model agent) are listed from your Home Assistant.':
      'Welke gespreksagent van Home Assistant antwoordt. De standaard is de ingebouwde; andere (bijvoorbeeld een taalmodelagent) komen uit je Home Assistant.',
    'LG’s own assistant reacts to the same button and sends the audio to LG. On: it is paused while voice is on. A reboot or switching this off undoes it.':
      'LG’s eigen assistent reageert op dezelfde knop en stuurt de audio naar LG. Aan: hij is gepauzeerd zolang spraak aan staat. Een herstart of dit uitzetten maakt het ongedaan.',
    'Records the code of the remote button that starts listening. Try the microphone button first; any spare button works.':
      'Legt de code vast van de knop die het luisteren start. Probeer eerst de microfoonknop; elke vrije knop werkt.',
    'Starts listening without the button: speak when the card appears.':
      'Start het luisteren zonder de knop: spreek als de kaart verschijnt.',
    'Where the recognised text goes. Shows how to set the address of your server. Without one, the text is only shown on screen.':
      'Waar de herkende tekst heen gaat. Toont hoe je het adres van je server instelt. Zonder server wordt de tekst alleen op het scherm getoond.',
    'Deletes the downloaded engine and model. The rest of CleanYourTV is not affected.':
      'Verwijdert de gedownloade engine en het model. De rest van CleanYourTV blijft.',
    'The remote’s Input button opens our Inputs list over the running app instead of LG’s picker. Open this screen to switch it off or to learn the button.':
      'De Input-knop van de afstandsbediening opent onze ingangenlijst over de lopende app in plaats van LG’s kiezer. Open dit scherm om het uit te zetten of de knop te leren.',
    'Shows a QR code. Scan it with a phone on the same Wi-Fi to copy a report for a bug report. Addresses and URL paths are masked; the page closes after ten minutes.':
      'Toont een QR-code. Scan hem met een telefoon op hetzelfde wifi-netwerk om een rapport voor een foutmelding te kopiëren. Adressen en URL-paden zijn verborgen; de pagina sluit na tien minuten.',
    'Removes the apps, the boot scripts and your settings, then restarts the TV so LG’s Home comes back.':
      'Verwijdert de apps, de opstartscripts en je instellingen en herstart dan de TV, zodat LG’s Home terugkomt.',
    'On: pressing Input shows our Inputs list. Off: LG’s picker comes back at once.':
      'Aan: op Input drukken toont onze ingangenlijst. Uit: LG’s kiezer komt meteen terug.',
    'Reads the code of your remote’s Input button from the hook, then tests that our list opens. The default is 241. Clear goes back to it.':
      'Leest de code van de Input-knop van je afstandsbediening uit de hook en test dan of onze lijst opent. De standaard is 241. Wissen gaat daarheen terug.',
    'Settings for Live TV: switch it on or off, set up or remove your playlist, refresh the guide and learn the Guide key.':
      'Instellingen voor Live TV: aan of uit, je afspeellijst instellen of verwijderen, de gids vernieuwen en de gidstoets leren.',
    'On: the launcher has a Live TV button and tile, the Inputs list has Live TV, and the Guide key can open the channel guide. Off: all of that is hidden and LG’s own player and guide are used. Your playlist is kept.':
      'Aan: de launcher heeft een Live TV-knop en -tegel, de ingangenlijst heeft Live TV, en de gidstoets kan de zendergids openen. Uit: dat alles is verborgen en LG’s eigen speler en gids worden gebruikt. Je afspeellijst blijft bewaard.',
    'Your M3U playlist and its XMLTV guide. Choose it to set up: a QR code opens a page on your phone where you enter the playlist address and the 6-digit code shown here.':
      'Je M3U-afspeellijst en de XMLTV-gids. Kies hem om in te stellen: een QR-code opent een pagina op je telefoon waar je het adres van de afspeellijst en de 6-cijferige code van hier invult.',
    'Downloads the playlist and the programme guide again now. It also happens twice a day.':
      'Downloadt de afspeellijst en de programmagids nu opnieuw. Dat gebeurt ook twee keer per dag.',
    'Empties the Recent tab and the list of channels that failed. Favourites stay.':
      'Leegt het tabblad Recent en de lijst met zenders die mislukten. Favorieten blijven.',
    'Deletes the playlist address, the channel list, the guide and your favourites from the TV.':
      'Verwijdert het adres van de afspeellijst, de zenderlijst, de gids en je favorieten van de TV.',
    'Deletes the playlist and everything stored for it on the TV. You can set it up again.':
      'Verwijdert de afspeellijst en alles wat ervoor op de TV is bewaard. Je kunt hem opnieuw instellen.',
    'Records the Guide button’s code. Afterwards it opens the Live TV channel guide over whatever is running (only while Live TV is on). Clear it to get LG’s guide back.':
      'Legt de code van de Guide-knop vast. Daarna opent hij de Live TV-gids over wat er ook draait (alleen als Live TV aan staat). Wis hem om LG’s gids terug te krijgen.',
    'How the Input button shows the Inputs. Over the running app, ready in the background: instant, tested on webOS 25. Over the running app, started when pressed: nothing runs hidden, so it cannot keep the remote; the default on older webOS, where the background one showed a loading circle. The launcher’s Inputs list: the TV goes to our Home (needs CleanYourTV as Home; otherwise the key stays with LG). Choose to go to the next one.':
      'Hoe de Input-knop de ingangen toont. Over de lopende app, klaar op de achtergrond: direct, getest op webOS 25. Over de lopende app, gestart bij indrukken: er draait niets verborgen, dus hij kan de afstandsbediening niet vasthouden; de standaard op oudere webOS, waar de achtergrondversie een laadcirkel toonde. De ingangenlijst van de launcher: de TV gaat naar onze Home (vraagt CleanYourTV als Home; anders blijft de knop bij LG). Kies om naar de volgende te gaan.',
    'Optional. Records the Home button’s code. The Home key keeps working exactly as before.':
      'Optioneel. Legt de code van de Home-knop vast. De Home-knop blijft precies werken zoals eerst.',
    'Back to the previous list.': 'Terug naar de vorige lijst.',
    'Nothing changes.': 'Er verandert niets.',
    'Deletes the apps, the boot scripts and the settings, then restarts the TV.':
      'Verwijdert de apps, de opstartscripts en de instellingen en herstart dan de TV.',
    'Restarts the TV; this launcher is Home after it starts.': 'Herstart de TV; daarna is deze launcher Home.',
    'Restarts the TV; LG’s own Home is Home after it starts. You can switch back here.':
      'Herstart de TV; daarna is LG’s eigen Home de Home. Je kunt hier terugschakelen.',
    'A newer package is available. Install it before the setup: it may contain fixes for your firmware.':
      'Er is een nieuwer pakket. Installeer het voor de installatie: het kan fixes voor je firmware bevatten.',
    'The remote’s Input button opens our Inputs list instead of LG’s picker. You can change this later.':
      'De Input-knop van de afstandsbediening opent onze ingangenlijst in plaats van LG’s kiezer. Je kunt dit later wijzigen.',
    'Installs the launcher, replaces LG’s Home at boot and starts the service. About a minute; the screen blinks once. If the new Home does not come up, the setup removes itself and restarts the TV.':
      'Installeert de launcher, vervangt LG’s Home bij het opstarten en start de service. Ongeveer een minuut; het scherm knippert één keer. Komt de nieuwe Home niet op, dan verwijdert de installatie zichzelf en herstart de TV.',
    'Your firmware is not in the compatibility list and LG’s Home looks different. This tries it anyway; a failed start restarts the TV with LG’s Home.':
      'Je firmware staat niet in de compatibiliteitslijst en LG’s Home ziet er anders uit. Dit probeert het toch; een mislukte start herstart de TV met LG’s Home.',
    'Works without the service: looks for a newer package and installs it through the root service.':
      'Werkt zonder de service: zoekt een nieuwer pakket en installeert het via de rootservice.',
    'This TV also has LG’s full-screen Home: if the Home button opens that instead of this launcher, set TV Settings > General > Home Settings > Home Style to Basic.':
      'Deze TV heeft ook LG’s schermvullende Home: opent de Home-knop die in plaats van deze launcher, zet dan TV-instellingen > Algemeen > Home-instellingen > Home-stijl op Basis.',
    '4K (the default) keeps photos at 3840 pixels, the size the TV draws Home at, so they look sharp; Full HD at 1920 fits about four times as many photos in 150 MB. It applies to new uploads and to the next Immich sync.':
      '4K (de standaard) bewaart foto’s op 3840 pixels, de grootte waarop de TV Home tekent, zodat ze scherp zijn; Full HD op 1920 past ongeveer vier keer zoveel foto’s in 150 MB. Geldt voor nieuwe uploads en de volgende Immich-synchronisatie.',
  },
  'de': {
    'Close': 'Schließen',
    'Back': 'Zurück',
    'Cancel': 'Abbrechen',
    'On': 'An',
    'Off': 'Aus',
    'selected': 'ausgewählt',
    'default': 'Standard',
    'never': 'nie',
    'just now': 'gerade eben',
    '%d min ago': 'vor %d Min.',
    '%d h ago': 'vor %d Std.',
    '%d days ago': 'vor %d Tagen',
    'Launcher %s': 'Launcher %s',
    'Service %s': 'Dienst %s',
    'Update to %s': 'Aktualisieren auf %s',
    'Update to %s (dev build)': 'Aktualisieren auf %s (Dev-Build)',
    'Checking…': 'Wird geprüft…',
    'No release yet': 'Noch keine Version',
    'Cannot check': 'Prüfung nicht möglich',
    'Up to date': 'Aktuell',
    'Check for updates': 'Nach Updates suchen',
    'Update channel': 'Update-Kanal',
    'Stable releases': 'Stabile Versionen',
    'Dev builds': 'Dev-Builds',
    'a release a day at most': 'höchstens eine Version pro Tag',
    'every change': 'jede Änderung',
    'build %s': 'Build %s',
    'none published right now': 'gerade keiner veröffentlicht',
    'Go back to launcher %s': 'Zurück zu Launcher %s',
    'Where updates come from': 'Woher Updates kommen',
    'Looking for the dev build…': 'Dev-Build wird gesucht…',
    'Switching…': 'Wird umgestellt…',
    'Back on the stable releases': 'Zurück bei den stabilen Versionen',
    'Following the dev builds. If the Launcher or Service row offers an update, that is the dev build.':
      'Die Dev-Builds werden verfolgt. Bietet die Zeile Launcher oder Dienst ein Update an, ist das der Dev-Build.',
    'Latest release %s': 'Neueste Version %s',
    'Updates: %s': 'Updates: %s',
    'Launcher %s · service %s': 'Launcher %s · Dienst %s',
    'CleanYourTV as Home': 'CleanYourTV als Home',
    'Live TV': 'Live-TV',
    'Wallpapers': 'Wallpapers',
    'Input key': 'Eingangstaste',
    'not available': 'nicht verfügbar',
    'Debloat': 'Debloat',
    '%d of %d on': '%d von %d an',
    'More': 'Mehr',
    'voice, network notifications': 'Sprache, Netzwerkbenachrichtigungen',
    'Share log': 'Protokoll teilen',
    'QR code for your phone': 'QR-Code für dein Handy',
    'Reset Home customisation': 'Home-Anpassungen zurücksetzen',
    'Uninstall': 'Deinstallieren',
    '%d photos': '%d Fotos',
    'Use CleanYourTV as Home': 'CleanYourTV als Home verwenden',
    'switching restarts the TV': 'Umschalten startet den Fernseher neu',
    'Learn the Home key': 'Home-Taste lernen',
    'optional': 'optional',
    'now: %s': 'jetzt: %s',
    'not learned': 'nicht gelernt',
    'Switch Home?': 'Home wechseln?',
    'Yes, use CleanYourTV as Home': 'Ja, CleanYourTV als Home verwenden',
    'Yes, use LG’s Home': 'Ja, LGs Home verwenden',
    'the TV restarts': 'der Fernseher startet neu',
    'Switching to CleanYourTV… the TV restarts in a moment.': 'Wechsel zu CleanYourTV… der Fernseher startet gleich neu.',
    'Switching to LG’s Home… the TV restarts in a moment.': 'Wechsel zu LGs Home… der Fernseher startet gleich neu.',
    'Remove CleanYourTV?': 'CleanYourTV entfernen?',
    'Yes, remove CleanYourTV': 'Ja, CleanYourTV entfernen',
    'settings and apps are deleted; the TV restarts': 'Einstellungen und Apps werden gelöscht; der Fernseher startet neu',
    'Removing CleanYourTV… the TV restarts in a moment and LG’s Home comes back.':
      'CleanYourTV wird entfernt… der Fernseher startet gleich neu und LGs Home ist zurück.',
    'Yes, reset Home': 'Ja, Home zurücksetzen',
    'dock, top buttons, hidden apps, app order and clock go back to the defaults':
      'Dock, obere Schaltflächen, ausgeblendete Apps, Reihenfolge und Uhr gehen auf den Standard zurück',
    'Home is back to the defaults. Open Home to see it.': 'Home ist wieder im Standard. Öffne Home, um es zu sehen.',
    'Live TV: your own playlist': 'Live-TV: deine eigene Playlist',
    'Show Live TV': 'Live-TV anzeigen',
    'Playlist': 'Playlist',
    '%d channels': '%d Sender',
    'guide for %d programmes': 'Programmführer für %d Sendungen',
    'not set': 'nicht eingerichtet',
    'set up from your phone': 'mit dem Handy einrichten',
    'Refresh playlist and guide': 'Playlist und Programmführer aktualisieren',
    'Refreshing…': 'Wird aktualisiert…',
    'Refreshing in the background': 'Wird im Hintergrund aktualisiert',
    'Learn the Guide key': 'Guide-Taste lernen',
    'LG’s guide stays': 'LGs Programmführer bleibt',
    'Live TV is off': 'Live-TV ist aus',
    'Clear recent channels': 'Letzte Sender löschen',
    'Recent channels cleared': 'Letzte Sender gelöscht',
    'Remove the playlist': 'Playlist entfernen',
    'nothing to remove': 'nichts zu entfernen',
    'Remove the playlist?': 'Playlist entfernen?',
    'Yes, remove the playlist': 'Ja, Playlist entfernen',
    'the address, the channel list, the guide and your favourites are deleted':
      'Adresse, Senderliste, Programmführer und Favoriten werden gelöscht',
    'No, keep it': 'Nein, behalten',
    'Playlist removed': 'Playlist entfernt',
    'Playlist saved': 'Playlist gespeichert',
    'Input key opens our Inputs list': 'Eingangstaste öffnet unsere Eingangsliste',
    'not available on this firmware': 'auf dieser Firmware nicht verfügbar',
    'Learn the Input key': 'Eingangstaste lernen',
    'default (%s)': 'Standard (%s)',
    'learned: %s': 'gelernt: %s',
    'Input key shows': 'Eingangstaste zeigt',
    'over the running app, ready in the background (instant)': 'über der laufenden App, im Hintergrund bereit (sofort)',
    'over the running app, started when pressed': 'über der laufenden App, beim Drücken gestartet',
    'the launcher’s Inputs list': 'die Eingangsliste des Launchers',
    'LG’s own list: CleanYourTV is not the Home': 'LGs eigene Liste: CleanYourTV ist nicht das Home',
    'Ads': 'Werbung',
    'Viewing tracking (LivePlus)': 'Sehverhalten-Tracking (LivePlus)',
    'Telemetry logs': 'Telemetrie-Protokolle',
    'Suggestions and nudges': 'Vorschläge und Hinweise',
    'ad services and ad servers': 'Werbedienste und Werbeserver',
    'Switch all on': 'Alles einschalten',
    'Switch all off': 'Alles ausschalten',
    'Debloat LG’s ads and telemetry': 'LGs Werbung und Telemetrie entfernen',
    'Voice': 'Sprache',
    'not installed': 'nicht installiert',
    'Network notifications': 'Netzwerkbenachrichtigungen',
    'Install voice': 'Sprache installieren',
    'installing…': 'wird installiert…',
    'downloads about 80 MB': 'lädt etwa 80 MB herunter',
    'Listen on the voice button': 'Auf die Sprachtaste hören',
    'learn a button first': 'zuerst eine Taste lernen',
    'Learn the voice button': 'Sprachtaste lernen',
    'Try it now': 'Jetzt ausprobieren',
    'listening…': 'hört zu…',
    'speak when the card appears': 'sprich, wenn die Karte erscheint',
    'Speak now…': 'Jetzt sprechen…',
    'Listening…': 'Hört zu…',
    'Switch off LG’s voice assistant': 'LGs Sprachassistenten ausschalten',
    'not paused yet': 'noch nicht pausiert',
    'Home Assistant (Assist)': 'Home Assistant (Assist)',
    'Which answers first': 'Was antwortet zuerst',
    'Home Assistant first, then the AI': 'Erst Home Assistant, dann die KI',
    'Home Assistant only': 'Nur Home Assistant',
    'The AI only': 'Nur die KI',
    'Assist agent': 'Assist-Agent',
    'set up Home Assistant first': 'zuerst Home Assistant einrichten',
    'AI chat (OpenRouter)': 'KI-Chat (OpenRouter)',
    'no key set': 'kein Schlüssel eingerichtet',
    'Model': 'Modell',
    'Send the text to': 'Text senden an',
    'not set · shows a card only': 'nicht eingerichtet · zeigt nur eine Karte',
    'Set up from your phone': 'Mit dem Handy einrichten',
    'key, model, Home Assistant, server': 'Schlüssel, Modell, Home Assistant, Server',
    'Set up with commands': 'Mit Befehlen einrichten',
    'for scripts and ssh': 'für Skripte und SSH',
    'Forget the conversation': 'Unterhaltung vergessen',
    'Conversation cleared': 'Unterhaltung gelöscht',
    'Remove voice': 'Sprache entfernen',
    'deletes the %d MB download': 'löscht den Download von %d MB',
    'Voice removed': 'Sprache entfernt',
    'Default agent': 'Standard-Agent',
    'Home Assistant’s own': 'der von Home Assistant',
    'Choose the model that answers': 'Wähle das Modell, das antwortet',
    'Choose the Home Assistant agent': 'Wähle den Home-Assistant-Agenten',
    'Loading the model list…': 'Modellliste wird geladen…',
    'Asking Home Assistant…': 'Home Assistant wird gefragt…',
    'Connected to %s': 'Verbunden mit %s',
    'Agent: %s': 'Agent: %s',
    'Model: %s': 'Modell: %s',
    'Saved': 'Gespeichert',
    'Voice · %s': 'Sprache · %s',
    'Last heard: “%s”': 'Zuletzt gehört: „%s“',
    'Last try: %s': 'Letzter Versuch: %s',
    'Accept notifications from the network': 'Benachrichtigungen aus dem Netzwerk annehmen',
    'How to send': 'So wird gesendet',
    'address, token, example': 'Adresse, Token, Beispiel',
    'Show as QR code': 'Als QR-Code zeigen',
    'scan with a phone to copy the address and token': 'mit dem Handy scannen, um Adresse und Token zu kopieren',
    'New token': 'Neues Token',
    'the old one stops working': 'das alte funktioniert nicht mehr',
    'New token created. Open “How to send” to see it.': 'Neues Token erstellt. Öffne „So wird gesendet“, um es zu sehen.',
    'Switch notifications on first': 'Zuerst Benachrichtigungen einschalten',
    'Manage from your phone': 'Mit dem Handy verwalten',
    'upload photos, configure Immich': 'Fotos hochladen, Immich einrichten',
    'Local uploads': 'Lokale Uploads',
    'Immich': 'Immich',
    'not connected': 'nicht verbunden',
    'syncing… %d new': 'wird synchronisiert… %d neu',
    'synced %s': 'synchronisiert %s',
    'Total': 'Gesamt',
    '%d of 150 MB': '%d von 150 MB',
    'Sync now': 'Jetzt synchronisieren',
    'syncing…': 'wird synchronisiert…',
    'Immich: new and changed photos': 'Immich: neue und geänderte Fotos',
    'connect Immich first': 'zuerst Immich verbinden',
    'Syncing with Immich…': 'Synchronisierung mit Immich…',
    'Picture size': 'Bildgröße',
    'Full HD (1920 px)': 'Full HD (1920 px)',
    '4K (3840 px)': '4K (3840 px)',
    'Remove all uploads': 'Alle Uploads entfernen',
    'Disconnect Immich': 'Immich trennen',
    'Yes, remove all uploads': 'Ja, alle Uploads entfernen',
    'Yes, disconnect Immich': 'Ja, Immich trennen',
    'the uploaded photos are deleted from the TV': 'die hochgeladenen Fotos werden vom Fernseher gelöscht',
    'the key is forgotten and its photos are deleted from the TV':
      'der Schlüssel wird vergessen und die Fotos werden vom Fernseher gelöscht',
    'Uploads removed': 'Uploads entfernt',
    'Immich disconnected': 'Immich getrennt',
    'Take over the Input key': 'Eingangstaste übernehmen',
    'Set up now': 'Jetzt einrichten',
    'the screen blinks once': 'der Bildschirm blinkt einmal',
    'Set up anyway': 'Trotzdem einrichten',
    'untested firmware; a failed start restarts the TV': 'ungetestete Firmware; ein fehlgeschlagener Start startet den Fernseher neu',
    'works without the service': 'funktioniert ohne den Dienst',
    'recommended first · installed %s': 'zuerst empfohlen · installiert %s',
    'The service is not running. Set it up to replace LG’s Home, take over the Input key and keep everything up to date.':
      'Der Dienst läuft nicht. Richte ihn ein, um LGs Home zu ersetzen, die Eingangstaste zu übernehmen und alles aktuell zu halten.',
    'Checking for updates…': 'Suche nach Updates…',
    'Could not check: %s': 'Prüfung fehlgeschlagen: %s',
    'no answer': 'keine Antwort',
    'Updating to %s…': 'Aktualisierung auf %s…',
    'Update failed: %s': 'Update fehlgeschlagen: %s',
    'The update is taking too long. Log: /tmp/cytv-selfupdate.log on the TV.':
      'Das Update dauert zu lange. Protokoll: /tmp/cytv-selfupdate.log auf dem Fernseher.',
    'Updating… %s': 'Aktualisierung… %s',
    'Setting up… the screen blinks once while LG’s system restarts':
      'Einrichtung… der Bildschirm blinkt einmal, während LGs System neu startet',
    'Setting up… %s': 'Einrichtung… %s',
    'Waiting for the service…': 'Warten auf den Dienst…',
    'The service did not answer': 'Der Dienst hat nicht geantwortet',
    'The service did not answer.': 'Der Dienst hat nicht geantwortet.',
    'Reading status…': 'Status wird gelesen…',
    'Preparing…': 'Wird vorbereitet…',
    'Share the log': 'Protokoll teilen',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Tap <b>Copy</b> on the page and paste it into your message.</li>':
      '<li>Handy im <b>selben WLAN</b> wie der Fernseher.</li><li>Den Code mit der Kamera scannen.</li><li>Auf der Seite <b>Kopieren</b> tippen und in deine Nachricht einfügen.</li>',
    'Preparing the report…': 'Bericht wird vorbereitet…',
    'The page is open for ten minutes. It lists versions, the setup log and the service log; addresses and URL paths are masked.':
      'Die Seite ist zehn Minuten geöffnet. Sie zeigt Versionen, das Einrichtungs- und das Dienstprotokoll; Adressen und URL-Pfade sind maskiert.',
    'Could not prepare the report (is the Homebrew Channel installed?).':
      'Bericht konnte nicht vorbereitet werden (ist der Homebrew Channel installiert?).',
    'Notification address and token': 'Benachrichtigungsadresse und Token',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera and open the page: it shows the address and the token with <b>Copy</b> buttons.</li><li>The token is a <b>secret</b>: anyone who sees this code while it is open can read it.</li>':
      '<li>Handy im <b>selben WLAN</b> wie der Fernseher.</li><li>Den Code mit der Kamera scannen und die Seite öffnen: Sie zeigt Adresse und Token mit <b>Kopieren</b>-Schaltflächen.</li><li>Das Token ist <b>geheim</b>: Wer diesen Code sieht, solange er offen ist, kann es lesen.</li>',
    'The notification listener is not running.': 'Der Benachrichtigungsempfang läuft nicht.',
    'The page opens for ten minutes. It is not encrypted: the token travels over your Wi-Fi, so use a network you trust.':
      'Die Seite ist zehn Minuten offen. Sie ist nicht verschlüsselt: Das Token geht über dein WLAN, also nutze ein Netzwerk, dem du vertraust.',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Choose <b>Upload photos</b> or <b>Configure Immich</b>.</li>':
      '<li>Handy im <b>selben WLAN</b> wie der Fernseher.</li><li>Den Code mit der Kamera scannen.</li><li><b>Upload photos</b> oder <b>Configure Immich</b> wählen.</li>',
    'The page stays open while you use it, at most an hour. It is not encrypted: your photos and the Immich key travel over your Wi-Fi.':
      'Die Seite bleibt offen, solange du sie nutzt, höchstens eine Stunde. Sie ist nicht verschlüsselt: Fotos und Immich-Schlüssel gehen über dein WLAN.',
    'Set up Live TV': 'Live-TV einrichten',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Enter the <b>code</b> below and your playlist address.</li>':
      '<li>Handy im <b>selben WLAN</b> wie der Fernseher.</li><li>Den Code mit der Kamera scannen.</li><li>Den <b>Code</b> unten und die Adresse deiner Playlist eingeben.</li>',
    'The page stays open for ten minutes. It is not encrypted: the playlist address, which may hold an access key, travels over your Wi-Fi.':
      'Die Seite bleibt zehn Minuten offen. Sie ist nicht verschlüsselt: Die Playlist-Adresse, die einen Zugangsschlüssel enthalten kann, geht über dein WLAN.',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Enter your <b>OpenRouter key</b> and model, or your <b>Home Assistant</b> address and access token, and tap <b>Save</b>.</li>':
      '<li>Handy im <b>selben WLAN</b> wie der Fernseher.</li><li>Den Code mit der Kamera scannen.</li><li><b>OpenRouter-Schlüssel</b> und Modell oder Adresse und Zugangstoken von <b>Home Assistant</b> eingeben und <b>Save</b> tippen.</li>',
    'The page stays open for ten minutes, or until you save. It is not encrypted: the key travels over your Wi-Fi, so use a network you trust.':
      'Die Seite bleibt zehn Minuten offen oder bis du speicherst. Sie ist nicht verschlüsselt: Der Schlüssel geht über dein WLAN, also nutze ein Netzwerk, dem du vertraust.',
    'The page has closed. Close this and try again.': 'Die Seite wurde geschlossen. Schließe dies und versuche es erneut.',
    '%s   code %s': '%s   Code %s',
    'Start': 'Start',
    'Skip': 'Überspringen',
    'Clear': 'Löschen',
    'default: %s': 'Standard: %s',
    'back to the default (241)': 'zurück zum Standard (241)',
    'forget the code': 'Code vergessen',
    'LG’s guide again': 'wieder LGs Programmführer',
    'The Input key.\nChoose Start, then press the Input button on your remote.':
      'Die Eingangstaste.\nWähle Start und drücke dann die Input-Taste auf deiner Fernbedienung.',
    'The Home key (optional).\nChoose Start, then press the Home button on your remote.':
      'Die Home-Taste (optional).\nWähle Start und drücke dann die Home-Taste auf deiner Fernbedienung.',
    'The voice button.\nChoose Start, then press the button you want to use for voice. The remote’s microphone button may not reach the hook; any spare button works.':
      'Die Sprachtaste.\nWähle Start und drücke dann die Taste, die du für Sprache nutzen willst. Die Mikrofontaste erreicht den Hook vielleicht nicht; jede freie Taste geht.',
    'The Guide key.\nChoose Start, then press the Guide button on your remote. It then opens the Live TV channel guide instead of LG’s guide. Clear it to get LG’s guide back.':
      'Die Guide-Taste.\nWähle Start und drücke dann die Guide-Taste auf deiner Fernbedienung. Sie öffnet danach den Live-TV-Programmführer statt LGs. Lösche sie, um LGs Programmführer zurückzubekommen.',
    'Done.\nInput key %s.\nThe Home key is optional: learn it from the main list if you want it recorded.':
      'Fertig.\nEingangstaste %s.\nDie Home-Taste ist optional: Lerne sie in der Hauptliste, wenn du sie speichern willst.',
    'Input key cleared.\nIt uses the default code (%s).': 'Eingangstaste gelöscht.\nSie nutzt den Standardcode (%s).',
    'Voice button cleared.': 'Sprachtaste gelöscht.',
    'Guide key cleared. LG’s guide is back.': 'Guide-Taste gelöscht. LGs Programmführer ist zurück.',
    'Home key cleared.': 'Home-Taste gelöscht.',
    'Press the %s button now…': 'Drücke jetzt die %s-Taste…',
    '%s key learned: code %s.': '%s-Taste gelernt: Code %s.',
    'Continue to the test': 'Weiter zum Test',
    'The hook did not attach on this firmware, so keys cannot be learned. The Input key stays with LG’s picker.\nUse Share log to report this.':
      'Der Hook hat sich auf dieser Firmware nicht verbunden, daher können keine Tasten gelernt werden. Die Eingangstaste bleibt bei LGs Auswahl.\nMelde dies über Protokoll teilen.',
    'Nothing was pressed.': 'Es wurde nichts gedrückt.',
    'Try again': 'Erneut versuchen',
    'Test.\nPress the Input button once more. Our Inputs list should open over this screen.':
      'Test.\nDrücke die Input-Taste noch einmal. Unsere Eingangsliste sollte sich über diesem Bildschirm öffnen.',
    'The Inputs list opened: the Input key works.': 'Die Eingangsliste wurde geöffnet: Die Eingangstaste funktioniert.',
    'Continue': 'Weiter',
    'The Inputs list did not open.\nIf LG’s own picker showed, the Input key is not mapped: learn it again or switch the Input key off.':
      'Die Eingangsliste wurde nicht geöffnet.\nWenn LGs eigene Auswahl erschien, ist die Eingangstaste nicht zugeordnet: Lerne sie erneut oder schalte die Eingangstaste aus.',
    'Learn again': 'Erneut lernen',
    'Input': 'Input',
    'Home': 'Home',
    'Guide': 'Guide',
    'voice': 'Sprach',
    'The home screen you see. Updates come from GitHub releases and are checked against a SHA-256 file before they are installed. If a new launcher does not start, the previous one is put back.':
      'Der Startbildschirm, den du siehst. Updates kommen aus GitHub-Versionen und werden vor der Installation mit einer SHA-256-Datei geprüft. Startet ein neuer Launcher nicht, kommt der vorige zurück.',
    'The background service behind the launcher: Live TV, picture notifications, the Input key, these updates. A failed update restores the previous files.':
      'Der Hintergrunddienst hinter dem Launcher: Live-TV, Bildbenachrichtigungen, die Eingangstaste, diese Updates. Ein fehlgeschlagenes Update stellt die vorigen Dateien wieder her.',
    'Looks for a newer release on GitHub. Nothing is installed until you choose an update.':
      'Sucht eine neuere Version auf GitHub. Es wird nichts installiert, bis du ein Update wählst.',
    'Stable releases are what most people want: at most one a day, made from the dev builds. Dev builds come with every change and can be less finished; choose Dev here, then use the Launcher and Service rows to install it. Going back to Stable offers the latest release again.':
      'Stabile Versionen sind das, was die meisten wollen: höchstens eine pro Tag, aus den Dev-Builds gemacht. Dev-Builds kommen mit jeder Änderung und können weniger fertig sein; wähle hier Dev und installiere mit den Zeilen Launcher und Dienst. Zurück zu Stabil bietet wieder die neueste Version an.',
    'Swaps the previous launcher version back in. The newer one stays available as an update.':
      'Setzt die vorige Launcher-Version wieder ein. Die neuere bleibt als Update verfügbar.',
    'Whether this launcher is Home, and learning the Home key.': 'Ob dieser Launcher das Home ist, und das Lernen der Home-Taste.',
    'Stops LG’s ad, recommendation and telemetry services and blocks a few ad servers. Nothing is uninstalled, and it only applies while this launcher is Home.':
      'Stoppt LGs Werbe-, Empfehlungs- und Telemetriedienste und sperrt einige Werbeserver. Es wird nichts deinstalliert, und es gilt nur, solange dieser Launcher das Home ist.',
    'Stops LG’s ad, tracking, telemetry and suggestion services, in four groups you can switch separately. Nothing is uninstalled, and it only applies while this launcher is Home.':
      'Stoppt LGs Werbe-, Tracking-, Telemetrie- und Vorschlagsdienste, in vier Gruppen, die du einzeln schalten kannst. Es wird nichts deinstalliert, und es gilt nur, solange dieser Launcher das Home ist.',
    'Keeps admanager and adoverlay-service from starting and points three LG ad servers at nothing in /etc/hosts.':
      'Verhindert den Start von admanager und adoverlay-service und lässt drei LG-Werbeserver in /etc/hosts ins Leere zeigen.',
    'Keeps acr2 from starting: the service that recognises what is on screen (LG calls it LivePlus) and reports it.':
      'Verhindert den Start von acr2: dem Dienst, der erkennt, was auf dem Bildschirm läuft (LG nennt es LivePlus), und es meldet.',
    'Stops remotelogger and service-logger, which collect logs and send them to LG.':
      'Stoppt remotelogger und service-logger, die Protokolle sammeln und an LG senden.',
    'Stops contentminer and nudge (recommendations and pop-up tips) and keeps sportsalarm from starting.':
      'Stoppt contentminer und nudge (Empfehlungen und Pop-up-Tipps) und verhindert den Start von sportsalarm.',
    'Switches every group on.': 'Schaltet jede Gruppe ein.',
    'Switches the debloat off: the services start again and the hosts lines are removed.':
      'Schaltet den Debloat aus: Die Dienste starten wieder und die Hosts-Zeilen werden entfernt.',
    'Voice and network notifications.': 'Sprache und Netzwerkbenachrichtigungen.',
    'Your own photos behind Home: uploaded from a phone, or synced from Immich albums. Switch them on in the launcher: Customise > Wallpapers.':
      'Deine eigenen Fotos hinter Home: mit dem Handy hochgeladen oder aus Immich-Alben synchronisiert. Schalte sie im Launcher ein: Anpassen > Wallpapers.',
    'Shows a QR code. On the phone page you upload photos (they are made the right size on the phone), delete uploads, connect Immich, choose albums and hide single photos.':
      'Zeigt einen QR-Code. Auf der Handy-Seite lädst du Fotos hoch (sie bekommen auf dem Handy die richtige Größe), löschst Uploads, verbindest Immich, wählst Alben und blendest einzelne Fotos aus.',
    'Photos uploaded from a phone, kept on the TV. At most 100.':
      'Mit dem Handy hochgeladene Fotos, auf dem Fernseher gespeichert. Höchstens 100.',
    'Photos from the Immich albums you chose, downloaded to the TV every six hours (and with Sync now), so Home never waits for Immich. At most 300.':
      'Fotos aus den gewählten Immich-Alben, alle sechs Stunden auf den Fernseher geladen (und mit Jetzt synchronisieren), damit Home nie auf Immich wartet. Höchstens 300.',
    'Every photo Wallpapers can show, and the space they use on the TV (at most 150 MB).':
      'Jedes Foto, das Wallpapers zeigen kann, und der Platz, den sie auf dem Fernseher belegen (höchstens 150 MB).',
    'Downloads new and changed photos from the chosen albums now and removes the ones that left them.':
      'Lädt jetzt neue und geänderte Fotos aus den gewählten Alben und entfernt die, die nicht mehr darin sind.',
    'Deletes every uploaded photo from the TV. Immich photos stay.': 'Löscht jedes hochgeladene Foto vom Fernseher. Immich-Fotos bleiben.',
    'Forgets the address and the key and deletes the Immich photos from the TV. Uploads stay.':
      'Vergisst Adresse und Schlüssel und löscht die Immich-Fotos vom Fernseher. Uploads bleiben.',
    'Puts the dock, the top buttons, hidden apps, the app order and the clock back to the defaults. The theme stays.':
      'Setzt Dock, obere Schaltflächen, ausgeblendete Apps, Reihenfolge und Uhr auf den Standard zurück. Das Design bleibt.',
    'The launcher’s own settings go back to the defaults. Apps, the theme and everything in this app stay.':
      'Die eigenen Einstellungen des Launchers gehen auf den Standard zurück. Apps, das Design und alles in dieser App bleiben.',
    'On: the Home button opens this launcher. Off: LG’s own Home. Switching restarts the TV (about a minute); the service keeps running either way.':
      'An: Die Home-Taste öffnet diesen Launcher. Aus: LGs eigenes Home. Umschalten startet den Fernseher neu (etwa eine Minute); der Dienst läuft in beiden Fällen weiter.',
    'Lets other devices on your network send picture notifications to this TV with a POST request and a secret token. Off by default.':
      'Lässt andere Geräte in deinem Netzwerk Bildbenachrichtigungen per POST-Anfrage und geheimem Token an diesen Fernseher senden. Standardmäßig aus.',
    'On: the TV listens on port 8767 for POST /notify with the token. Anyone who has the token and network access can show cards on this screen.':
      'An: Der Fernseher lauscht auf Port 8767 auf POST /notify mit dem Token. Wer das Token und Netzwerkzugang hat, kann Karten auf diesem Bildschirm zeigen.',
    'Shows the address, the token and an example request.': 'Zeigt Adresse, Token und eine Beispielanfrage.',
    'Shows a QR code. A phone that scans it opens a page, served by the TV for ten minutes, that shows the notification address and the token with Copy buttons (for Home Assistant, for example). The token is a secret.':
      'Zeigt einen QR-Code. Ein Handy, das ihn scannt, öffnet eine Seite, die der Fernseher zehn Minuten bereitstellt, mit Benachrichtigungsadresse und Token samt Kopieren-Schaltflächen (zum Beispiel für Home Assistant). Das Token ist geheim.',
    'Creates a new secret token. Devices using the old one stop working.':
      'Erstellt ein neues geheimes Token. Geräte mit dem alten funktionieren nicht mehr.',
    'Optional. Speak into the remote and the TV turns it into text on the TV itself (Moonshine, English). The text can be sent to a server you run. Audio never leaves the TV. Needs a download of about 80 MB.':
      'Optional. Sprich in die Fernbedienung, und der Fernseher macht daraus auf dem Gerät selbst Text (Moonshine, Englisch). Der Text kann an einen eigenen Server gehen. Audio verlässt den Fernseher nie. Braucht einen Download von etwa 80 MB.',
    'Downloads the speech engine, a 64-bit C library and the model (checksums are verified), then tests them. About a minute. Nothing is installed in the system folders.':
      'Lädt die Sprach-Engine, eine 64-Bit-C-Bibliothek und das Modell (Prüfsummen werden geprüft) und testet sie. Etwa eine Minute. In den Systemordnern wird nichts installiert.',
    'On: pressing the button you learned starts listening. A card shows what was heard.':
      'An: Die gelernte Taste startet das Zuhören. Eine Karte zeigt, was gehört wurde.',
    'On: what you say is also sent as text to a language model through OpenRouter and the answer is shown on screen. Needs your OpenRouter key; the text goes to OpenRouter and the model provider, never audio.':
      'An: Was du sagst, geht auch als Text über OpenRouter an ein Sprachmodell, und die Antwort erscheint auf dem Bildschirm. Braucht deinen OpenRouter-Schlüssel; der Text geht an OpenRouter und den Modellanbieter, nie Audio.',
    'Shows a QR code. Scan it with a phone on the same Wi-Fi to enter your OpenRouter key, choose a model, write instructions and set a server address. Nothing is typed on the TV.':
      'Zeigt einen QR-Code. Scanne ihn mit einem Handy im selben WLAN, um deinen OpenRouter-Schlüssel einzugeben, ein Modell zu wählen, Anweisungen zu schreiben und eine Serveradresse festzulegen. Auf dem Fernseher wird nichts getippt.',
    'Choose the model that answers. The list is read from OpenRouter: the newest models of the main providers, with the price per million words in. The phone page lists every model.':
      'Wähle das Modell, das antwortet. Die Liste kommt von OpenRouter: die neuesten Modelle der großen Anbieter, mit dem Preis pro Million Eingabewörter. Die Handy-Seite zeigt jedes Modell.',
    'Shows the commands to set the key, model and instructions from a shell, and how to ask by text.':
      'Zeigt die Befehle, um Schlüssel, Modell und Anweisungen aus einer Shell einzurichten, und wie man per Text fragt.',
    'The AI and Home Assistant remember the last turns for ten minutes. This clears them.':
      'Die KI und Home Assistant merken sich die letzten Beiträge zehn Minuten. Dies löscht sie.',
    'Sends what you say as text to Home Assistant’s Assist and shows its answer. Needs the address and a long-lived access token (Home Assistant profile page), entered on your phone. Choosing this row tests the connection.':
      'Sendet das Gesagte als Text an Home Assistants Assist und zeigt die Antwort. Braucht die Adresse und ein langlebiges Zugangstoken (Profilseite in Home Assistant), am Handy eingegeben. Diese Zeile zu wählen testet die Verbindung.',
    'Home Assistant first, then the AI: Assist gets the text; if it does not understand, the AI answers. Home Assistant only: never the AI. The AI only: Home Assistant is not asked. Choose to switch.':
      'Erst Home Assistant, dann die KI: Assist bekommt den Text; versteht es ihn nicht, antwortet die KI. Nur Home Assistant: nie die KI. Nur die KI: Home Assistant wird nicht gefragt. Wählen zum Wechseln.',
    'Which Home Assistant conversation agent answers. The default is the built-in one; others (for example a language-model agent) are listed from your Home Assistant.':
      'Welcher Unterhaltungsagent von Home Assistant antwortet. Standard ist der eingebaute; andere (etwa ein Sprachmodell-Agent) kommen aus deinem Home Assistant.',
    'LG’s own assistant reacts to the same button and sends the audio to LG. On: it is paused while voice is on. A reboot or switching this off undoes it.':
      'LGs eigener Assistent reagiert auf dieselbe Taste und schickt das Audio an LG. An: Er ist pausiert, solange Sprache an ist. Ein Neustart oder Ausschalten macht es rückgängig.',
    'Records the code of the remote button that starts listening. Try the microphone button first; any spare button works.':
      'Speichert den Code der Taste, die das Zuhören startet. Probiere zuerst die Mikrofontaste; jede freie Taste geht.',
    'Starts listening without the button: speak when the card appears.':
      'Startet das Zuhören ohne Taste: Sprich, wenn die Karte erscheint.',
    'Where the recognised text goes. Shows how to set the address of your server. Without one, the text is only shown on screen.':
      'Wohin der erkannte Text geht. Zeigt, wie du die Adresse deines Servers einrichtest. Ohne Server wird der Text nur angezeigt.',
    'Deletes the downloaded engine and model. The rest of CleanYourTV is not affected.':
      'Löscht die geladene Engine und das Modell. Der Rest von CleanYourTV bleibt.',
    'The remote’s Input button opens our Inputs list over the running app instead of LG’s picker. Open this screen to switch it off or to learn the button.':
      'Die Input-Taste der Fernbedienung öffnet unsere Eingangsliste über der laufenden App statt LGs Auswahl. Öffne diesen Bildschirm, um es auszuschalten oder die Taste zu lernen.',
    'Shows a QR code. Scan it with a phone on the same Wi-Fi to copy a report for a bug report. Addresses and URL paths are masked; the page closes after ten minutes.':
      'Zeigt einen QR-Code. Scanne ihn mit einem Handy im selben WLAN, um einen Bericht für eine Fehlermeldung zu kopieren. Adressen und URL-Pfade sind maskiert; die Seite schließt nach zehn Minuten.',
    'Removes the apps, the boot scripts and your settings, then restarts the TV so LG’s Home comes back.':
      'Entfernt die Apps, die Startskripte und deine Einstellungen und startet dann den Fernseher neu, damit LGs Home zurückkommt.',
    'On: pressing Input shows our Inputs list. Off: LG’s picker comes back at once.':
      'An: Input zeigt unsere Eingangsliste. Aus: LGs Auswahl ist sofort zurück.',
    'Reads the code of your remote’s Input button from the hook, then tests that our list opens. The default is 241. Clear goes back to it.':
      'Liest den Code der Input-Taste deiner Fernbedienung aus dem Hook und testet dann, ob unsere Liste aufgeht. Standard ist 241. Löschen geht dorthin zurück.',
    'Settings for Live TV: switch it on or off, set up or remove your playlist, refresh the guide and learn the Guide key.':
      'Einstellungen für Live-TV: an oder aus, Playlist einrichten oder entfernen, Programmführer aktualisieren und Guide-Taste lernen.',
    'On: the launcher has a Live TV button and tile, the Inputs list has Live TV, and the Guide key can open the channel guide. Off: all of that is hidden and LG’s own player and guide are used. Your playlist is kept.':
      'An: Der Launcher hat eine Live-TV-Schaltfläche und -Kachel, die Eingangsliste hat Live-TV, und die Guide-Taste kann den Programmführer öffnen. Aus: All das ist ausgeblendet und LGs eigener Player und Programmführer werden genutzt. Deine Playlist bleibt erhalten.',
    'Your M3U playlist and its XMLTV guide. Choose it to set up: a QR code opens a page on your phone where you enter the playlist address and the 6-digit code shown here.':
      'Deine M3U-Playlist und ihr XMLTV-Programmführer. Wähle sie zum Einrichten: Ein QR-Code öffnet eine Seite auf deinem Handy, auf der du die Playlist-Adresse und den hier gezeigten 6-stelligen Code eingibst.',
    'Downloads the playlist and the programme guide again now. It also happens twice a day.':
      'Lädt Playlist und Programmführer jetzt neu. Das passiert auch zweimal am Tag.',
    'Empties the Recent tab and the list of channels that failed. Favourites stay.':
      'Leert den Reiter Zuletzt und die Liste fehlgeschlagener Sender. Favoriten bleiben.',
    'Deletes the playlist address, the channel list, the guide and your favourites from the TV.':
      'Löscht Playlist-Adresse, Senderliste, Programmführer und Favoriten vom Fernseher.',
    'Deletes the playlist and everything stored for it on the TV. You can set it up again.':
      'Löscht die Playlist und alles, was dafür auf dem Fernseher gespeichert ist. Du kannst sie neu einrichten.',
    'Records the Guide button’s code. Afterwards it opens the Live TV channel guide over whatever is running (only while Live TV is on). Clear it to get LG’s guide back.':
      'Speichert den Code der Guide-Taste. Danach öffnet sie den Live-TV-Programmführer über allem, was läuft (nur wenn Live-TV an ist). Lösche sie, um LGs Programmführer zurückzubekommen.',
    'How the Input button shows the Inputs. Over the running app, ready in the background: instant, tested on webOS 25. Over the running app, started when pressed: nothing runs hidden, so it cannot keep the remote; the default on older webOS, where the background one showed a loading circle. The launcher’s Inputs list: the TV goes to our Home (needs CleanYourTV as Home; otherwise the key stays with LG). Choose to go to the next one.':
      'Wie die Input-Taste die Eingänge zeigt. Über der laufenden App, im Hintergrund bereit: sofort, getestet auf webOS 25. Über der laufenden App, beim Drücken gestartet: Nichts läuft versteckt, daher kann sie die Fernbedienung nicht festhalten; der Standard auf älteren webOS, wo die Hintergrundvariante einen Ladekreis zeigte. Die Eingangsliste des Launchers: Der Fernseher geht zu unserem Home (braucht CleanYourTV als Home; sonst bleibt die Taste bei LG). Wählen, um zur nächsten zu wechseln.',
    'Optional. Records the Home button’s code. The Home key keeps working exactly as before.':
      'Optional. Speichert den Code der Home-Taste. Die Home-Taste funktioniert genau wie vorher.',
    'Back to the previous list.': 'Zurück zur vorigen Liste.',
    'Nothing changes.': 'Es ändert sich nichts.',
    'Deletes the apps, the boot scripts and the settings, then restarts the TV.':
      'Entfernt die Apps, die Startskripte und die Einstellungen und startet dann den Fernseher neu.',
    'Restarts the TV; this launcher is Home after it starts.': 'Startet den Fernseher neu; danach ist dieser Launcher das Home.',
    'Restarts the TV; LG’s own Home is Home after it starts. You can switch back here.':
      'Startet den Fernseher neu; danach ist LGs eigenes Home das Home. Du kannst hier zurückwechseln.',
    'A newer package is available. Install it before the setup: it may contain fixes for your firmware.':
      'Ein neueres Paket ist verfügbar. Installiere es vor der Einrichtung: Es kann Korrekturen für deine Firmware enthalten.',
    'The remote’s Input button opens our Inputs list instead of LG’s picker. You can change this later.':
      'Die Input-Taste der Fernbedienung öffnet unsere Eingangsliste statt LGs Auswahl. Du kannst das später ändern.',
    'Installs the launcher, replaces LG’s Home at boot and starts the service. About a minute; the screen blinks once. If the new Home does not come up, the setup removes itself and restarts the TV.':
      'Installiert den Launcher, ersetzt LGs Home beim Start und startet den Dienst. Etwa eine Minute; der Bildschirm blinkt einmal. Kommt das neue Home nicht hoch, entfernt sich die Einrichtung und startet den Fernseher neu.',
    'Your firmware is not in the compatibility list and LG’s Home looks different. This tries it anyway; a failed start restarts the TV with LG’s Home.':
      'Deine Firmware steht nicht in der Kompatibilitätsliste und LGs Home sieht anders aus. Dies versucht es trotzdem; ein fehlgeschlagener Start startet den Fernseher mit LGs Home neu.',
    'Works without the service: looks for a newer package and installs it through the root service.':
      'Funktioniert ohne den Dienst: sucht ein neueres Paket und installiert es über den Root-Dienst.',
    'This TV also has LG’s full-screen Home: if the Home button opens that instead of this launcher, set TV Settings > General > Home Settings > Home Style to Basic.':
      'Dieser Fernseher hat auch LGs Vollbild-Home: Öffnet die Home-Taste dieses statt des Launchers, stelle Einstellungen > Allgemein > Home-Einstellungen > Home-Stil auf Einfach.',
    '4K (the default) keeps photos at 3840 pixels, the size the TV draws Home at, so they look sharp; Full HD at 1920 fits about four times as many photos in 150 MB. It applies to new uploads and to the next Immich sync.':
      '4K (Standard) speichert Fotos mit 3840 Pixeln, der Größe, in der der Fernseher Home zeichnet, damit sie scharf sind; Full HD mit 1920 passt etwa viermal so viele Fotos in 150 MB. Gilt für neue Uploads und die nächste Immich-Synchronisierung.',
  },
  'fr': {
    'Close': 'Fermer',
    'Back': 'Retour',
    'Cancel': 'Annuler',
    'On': 'Activé',
    'Off': 'Désactivé',
    'selected': 'choisi',
    'default': 'par défaut',
    'never': 'jamais',
    'just now': 'à l’instant',
    '%d min ago': 'il y a %d min',
    '%d h ago': 'il y a %d h',
    '%d days ago': 'il y a %d jours',
    'Launcher %s': 'Launcher %s',
    'Service %s': 'Service %s',
    'Update to %s': 'Mettre à jour vers %s',
    'Update to %s (dev build)': 'Mettre à jour vers %s (version dev)',
    'Checking…': 'Vérification…',
    'No release yet': 'Pas encore de version',
    'Cannot check': 'Vérification impossible',
    'Up to date': 'À jour',
    'Check for updates': 'Rechercher des mises à jour',
    'Update channel': 'Canal de mise à jour',
    'Stable releases': 'Versions stables',
    'Dev builds': 'Versions dev',
    'a release a day at most': 'au plus une version par jour',
    'every change': 'chaque changement',
    'build %s': 'version %s',
    'none published right now': 'aucune publiée pour l’instant',
    'Go back to launcher %s': 'Revenir au launcher %s',
    'Where updates come from': 'D’où viennent les mises à jour',
    'Looking for the dev build…': 'Recherche de la version dev…',
    'Switching…': 'Changement…',
    'Back on the stable releases': 'Retour aux versions stables',
    'Following the dev builds. If the Launcher or Service row offers an update, that is the dev build.':
      'Les versions dev sont suivies. Si la ligne Launcher ou Service propose une mise à jour, c’est la version dev.',
    'Latest release %s': 'Dernière version %s',
    'Updates: %s': 'Mises à jour : %s',
    'Launcher %s · service %s': 'Launcher %s · service %s',
    'CleanYourTV as Home': 'CleanYourTV comme accueil',
    'Live TV': 'TV en direct',
    'Wallpapers': 'Wallpapers',
    'Input key': 'Touche Entrée',
    'not available': 'non disponible',
    'Debloat': 'Debloat',
    '%d of %d on': '%d sur %d activés',
    'More': 'Plus',
    'voice, network notifications': 'voix, notifications réseau',
    'Share log': 'Partager le journal',
    'QR code for your phone': 'code QR pour votre téléphone',
    'Reset Home customisation': 'Réinitialiser la personnalisation de l’accueil',
    'Uninstall': 'Désinstaller',
    '%d photos': '%d photos',
    'Use CleanYourTV as Home': 'Utiliser CleanYourTV comme accueil',
    'switching restarts the TV': 'changer redémarre le téléviseur',
    'Learn the Home key': 'Apprendre la touche Accueil',
    'optional': 'facultatif',
    'now: %s': 'actuel : %s',
    'not learned': 'non appris',
    'Switch Home?': 'Changer d’accueil ?',
    'Yes, use CleanYourTV as Home': 'Oui, utiliser CleanYourTV comme accueil',
    'Yes, use LG’s Home': 'Oui, utiliser l’accueil de LG',
    'the TV restarts': 'le téléviseur redémarre',
    'Switching to CleanYourTV… the TV restarts in a moment.': 'Passage à CleanYourTV… le téléviseur redémarre dans un instant.',
    'Switching to LG’s Home… the TV restarts in a moment.': 'Passage à l’accueil de LG… le téléviseur redémarre dans un instant.',
    'Remove CleanYourTV?': 'Supprimer CleanYourTV ?',
    'Yes, remove CleanYourTV': 'Oui, supprimer CleanYourTV',
    'settings and apps are deleted; the TV restarts': 'les réglages et les apps sont supprimés ; le téléviseur redémarre',
    'Removing CleanYourTV… the TV restarts in a moment and LG’s Home comes back.':
      'Suppression de CleanYourTV… le téléviseur redémarre dans un instant et l’accueil de LG revient.',
    'Yes, reset Home': 'Oui, réinitialiser l’accueil',
    'dock, top buttons, hidden apps, app order and clock go back to the defaults':
      'dock, boutons du haut, apps masquées, ordre et horloge reviennent aux réglages par défaut',
    'Home is back to the defaults. Open Home to see it.': 'L’accueil est revenu aux réglages par défaut. Ouvrez l’accueil pour le voir.',
    'Live TV: your own playlist': 'TV en direct : votre propre playlist',
    'Show Live TV': 'Afficher la TV en direct',
    'Playlist': 'Playlist',
    '%d channels': '%d chaînes',
    'guide for %d programmes': 'guide pour %d programmes',
    'not set': 'non configuré',
    'set up from your phone': 'configurer depuis votre téléphone',
    'Refresh playlist and guide': 'Actualiser la playlist et le guide',
    'Refreshing…': 'Actualisation…',
    'Refreshing in the background': 'Actualisation en arrière-plan',
    'Learn the Guide key': 'Apprendre la touche Guide',
    'LG’s guide stays': 'le guide de LG reste',
    'Live TV is off': 'La TV en direct est désactivée',
    'Clear recent channels': 'Effacer les chaînes récentes',
    'Recent channels cleared': 'Chaînes récentes effacées',
    'Remove the playlist': 'Supprimer la playlist',
    'nothing to remove': 'rien à supprimer',
    'Remove the playlist?': 'Supprimer la playlist ?',
    'Yes, remove the playlist': 'Oui, supprimer la playlist',
    'the address, the channel list, the guide and your favourites are deleted':
      'l’adresse, la liste des chaînes, le guide et vos favoris sont supprimés',
    'No, keep it': 'Non, la garder',
    'Playlist removed': 'Playlist supprimée',
    'Playlist saved': 'Playlist enregistrée',
    'Input key opens our Inputs list': 'La touche Entrée ouvre notre liste d’entrées',
    'not available on this firmware': 'non disponible sur ce firmware',
    'Learn the Input key': 'Apprendre la touche Entrée',
    'default (%s)': 'par défaut (%s)',
    'learned: %s': 'appris : %s',
    'Input key shows': 'La touche Entrée affiche',
    'over the running app, ready in the background (instant)': 'par-dessus l’app en cours, prête en arrière-plan (instantané)',
    'over the running app, started when pressed': 'par-dessus l’app en cours, lancée à l’appui',
    'the launcher’s Inputs list': 'la liste d’entrées du launcher',
    'LG’s own list: CleanYourTV is not the Home': 'la liste de LG : CleanYourTV n’est pas l’accueil',
    'Ads': 'Publicités',
    'Viewing tracking (LivePlus)': 'Suivi du visionnage (LivePlus)',
    'Telemetry logs': 'Journaux de télémétrie',
    'Suggestions and nudges': 'Suggestions et incitations',
    'ad services and ad servers': 'services et serveurs publicitaires',
    'Switch all on': 'Tout activer',
    'Switch all off': 'Tout désactiver',
    'Debloat LG’s ads and telemetry': 'Supprimer les pubs et la télémétrie de LG',
    'Voice': 'Voix',
    'not installed': 'non installé',
    'Network notifications': 'Notifications réseau',
    'Install voice': 'Installer la voix',
    'installing…': 'installation…',
    'downloads about 80 MB': 'télécharge environ 80 Mo',
    'Listen on the voice button': 'Écouter sur le bouton voix',
    'learn a button first': 'apprenez d’abord un bouton',
    'Learn the voice button': 'Apprendre le bouton voix',
    'Try it now': 'Essayer maintenant',
    'listening…': 'écoute…',
    'speak when the card appears': 'parlez quand la carte apparaît',
    'Speak now…': 'Parlez maintenant…',
    'Listening…': 'Écoute…',
    'Switch off LG’s voice assistant': 'Désactiver l’assistant vocal de LG',
    'not paused yet': 'pas encore en pause',
    'Home Assistant (Assist)': 'Home Assistant (Assist)',
    'Which answers first': 'Qui répond en premier',
    'Home Assistant first, then the AI': 'D’abord Home Assistant, puis l’IA',
    'Home Assistant only': 'Home Assistant seulement',
    'The AI only': 'L’IA seulement',
    'Assist agent': 'Agent Assist',
    'set up Home Assistant first': 'configurez d’abord Home Assistant',
    'AI chat (OpenRouter)': 'Chat IA (OpenRouter)',
    'no key set': 'aucune clé configurée',
    'Model': 'Modèle',
    'Send the text to': 'Envoyer le texte à',
    'not set · shows a card only': 'non configuré · affiche seulement une carte',
    'Set up from your phone': 'Configurer depuis votre téléphone',
    'key, model, Home Assistant, server': 'clé, modèle, Home Assistant, serveur',
    'Set up with commands': 'Configurer par commandes',
    'for scripts and ssh': 'pour les scripts et ssh',
    'Forget the conversation': 'Oublier la conversation',
    'Conversation cleared': 'Conversation effacée',
    'Remove voice': 'Supprimer la voix',
    'deletes the %d MB download': 'supprime le téléchargement de %d Mo',
    'Voice removed': 'Voix supprimée',
    'Default agent': 'Agent par défaut',
    'Home Assistant’s own': 'celui de Home Assistant',
    'Choose the model that answers': 'Choisissez le modèle qui répond',
    'Choose the Home Assistant agent': 'Choisissez l’agent Home Assistant',
    'Loading the model list…': 'Chargement de la liste des modèles…',
    'Asking Home Assistant…': 'Interrogation de Home Assistant…',
    'Connected to %s': 'Connecté à %s',
    'Agent: %s': 'Agent : %s',
    'Model: %s': 'Modèle : %s',
    'Saved': 'Enregistré',
    'Voice · %s': 'Voix · %s',
    'Last heard: “%s”': 'Dernière écoute : « %s »',
    'Last try: %s': 'Dernier essai : %s',
    'Accept notifications from the network': 'Accepter les notifications du réseau',
    'How to send': 'Comment envoyer',
    'address, token, example': 'adresse, jeton, exemple',
    'Show as QR code': 'Afficher en code QR',
    'scan with a phone to copy the address and token': 'scannez avec un téléphone pour copier l’adresse et le jeton',
    'New token': 'Nouveau jeton',
    'the old one stops working': 'l’ancien ne fonctionne plus',
    'New token created. Open “How to send” to see it.': 'Nouveau jeton créé. Ouvrez « Comment envoyer » pour le voir.',
    'Switch notifications on first': 'Activez d’abord les notifications',
    'Manage from your phone': 'Gérer depuis votre téléphone',
    'upload photos, configure Immich': 'envoyer des photos, configurer Immich',
    'Local uploads': 'Envois locaux',
    'Immich': 'Immich',
    'not connected': 'non connecté',
    'syncing… %d new': 'synchronisation… %d nouvelles',
    'synced %s': 'synchronisé %s',
    'Total': 'Total',
    '%d of 150 MB': '%d sur 150 Mo',
    'Sync now': 'Synchroniser maintenant',
    'syncing…': 'synchronisation…',
    'Immich: new and changed photos': 'Immich : photos nouvelles et modifiées',
    'connect Immich first': 'connectez d’abord Immich',
    'Syncing with Immich…': 'Synchronisation avec Immich…',
    'Picture size': 'Taille des images',
    'Full HD (1920 px)': 'Full HD (1920 px)',
    '4K (3840 px)': '4K (3840 px)',
    'Remove all uploads': 'Supprimer tous les envois',
    'Disconnect Immich': 'Déconnecter Immich',
    'Yes, remove all uploads': 'Oui, supprimer tous les envois',
    'Yes, disconnect Immich': 'Oui, déconnecter Immich',
    'the uploaded photos are deleted from the TV': 'les photos envoyées sont supprimées du téléviseur',
    'the key is forgotten and its photos are deleted from the TV': 'la clé est oubliée et ses photos sont supprimées du téléviseur',
    'Uploads removed': 'Envois supprimés',
    'Immich disconnected': 'Immich déconnecté',
    'Take over the Input key': 'Prendre la touche Entrée',
    'Set up now': 'Configurer maintenant',
    'the screen blinks once': 'l’écran clignote une fois',
    'Set up anyway': 'Configurer quand même',
    'untested firmware; a failed start restarts the TV': 'firmware non testé ; un démarrage raté redémarre le téléviseur',
    'works without the service': 'fonctionne sans le service',
    'recommended first · installed %s': 'recommandé d’abord · installée %s',
    'The service is not running. Set it up to replace LG’s Home, take over the Input key and keep everything up to date.':
      'Le service ne tourne pas. Configurez-le pour remplacer l’accueil de LG, prendre la touche Entrée et tout garder à jour.',
    'Checking for updates…': 'Recherche de mises à jour…',
    'Could not check: %s': 'Vérification impossible : %s',
    'no answer': 'pas de réponse',
    'Updating to %s…': 'Mise à jour vers %s…',
    'Update failed: %s': 'Échec de la mise à jour : %s',
    'The update is taking too long. Log: /tmp/cytv-selfupdate.log on the TV.':
      'La mise à jour prend trop de temps. Journal : /tmp/cytv-selfupdate.log sur le téléviseur.',
    'Updating… %s': 'Mise à jour… %s',
    'Setting up… the screen blinks once while LG’s system restarts':
      'Configuration… l’écran clignote une fois pendant le redémarrage du système de LG',
    'Setting up… %s': 'Configuration… %s',
    'Waiting for the service…': 'Attente du service…',
    'The service did not answer': 'Le service n’a pas répondu',
    'The service did not answer.': 'Le service n’a pas répondu.',
    'Reading status…': 'Lecture de l’état…',
    'Preparing…': 'Préparation…',
    'Share the log': 'Partager le journal',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Tap <b>Copy</b> on the page and paste it into your message.</li>':
      '<li>Téléphone sur le <b>même Wi-Fi</b> que le téléviseur.</li><li>Scannez le code avec l’appareil photo.</li><li>Touchez <b>Copier</b> sur la page et collez-le dans votre message.</li>',
    'Preparing the report…': 'Préparation du rapport…',
    'The page is open for ten minutes. It lists versions, the setup log and the service log; addresses and URL paths are masked.':
      'La page est ouverte dix minutes. Elle liste les versions, le journal d’installation et celui du service ; adresses et chemins d’URL sont masqués.',
    'Could not prepare the report (is the Homebrew Channel installed?).':
      'Impossible de préparer le rapport (le Homebrew Channel est-il installé ?).',
    'Notification address and token': 'Adresse et jeton de notification',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera and open the page: it shows the address and the token with <b>Copy</b> buttons.</li><li>The token is a <b>secret</b>: anyone who sees this code while it is open can read it.</li>':
      '<li>Téléphone sur le <b>même Wi-Fi</b> que le téléviseur.</li><li>Scannez le code et ouvrez la page : elle affiche l’adresse et le jeton avec des boutons <b>Copier</b>.</li><li>Le jeton est <b>secret</b> : quiconque voit ce code pendant qu’il est ouvert peut le lire.</li>',
    'The notification listener is not running.': 'L’écoute des notifications ne tourne pas.',
    'The page opens for ten minutes. It is not encrypted: the token travels over your Wi-Fi, so use a network you trust.':
      'La page s’ouvre dix minutes. Elle n’est pas chiffrée : le jeton passe par votre Wi-Fi, utilisez un réseau de confiance.',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Choose <b>Upload photos</b> or <b>Configure Immich</b>.</li>':
      '<li>Téléphone sur le <b>même Wi-Fi</b> que le téléviseur.</li><li>Scannez le code avec l’appareil photo.</li><li>Choisissez <b>Upload photos</b> ou <b>Configure Immich</b>.</li>',
    'The page stays open while you use it, at most an hour. It is not encrypted: your photos and the Immich key travel over your Wi-Fi.':
      'La page reste ouverte tant que vous l’utilisez, une heure au plus. Elle n’est pas chiffrée : vos photos et la clé Immich passent par votre Wi-Fi.',
    'Set up Live TV': 'Configurer la TV en direct',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Enter the <b>code</b> below and your playlist address.</li>':
      '<li>Téléphone sur le <b>même Wi-Fi</b> que le téléviseur.</li><li>Scannez le code avec l’appareil photo.</li><li>Saisissez le <b>code</b> ci-dessous et l’adresse de votre playlist.</li>',
    'The page stays open for ten minutes. It is not encrypted: the playlist address, which may hold an access key, travels over your Wi-Fi.':
      'La page reste ouverte dix minutes. Elle n’est pas chiffrée : l’adresse de la playlist, qui peut contenir une clé d’accès, passe par votre Wi-Fi.',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Enter your <b>OpenRouter key</b> and model, or your <b>Home Assistant</b> address and access token, and tap <b>Save</b>.</li>':
      '<li>Téléphone sur le <b>même Wi-Fi</b> que le téléviseur.</li><li>Scannez le code avec l’appareil photo.</li><li>Saisissez votre <b>clé OpenRouter</b> et le modèle, ou l’adresse et le jeton d’accès de <b>Home Assistant</b>, puis touchez <b>Save</b>.</li>',
    'The page stays open for ten minutes, or until you save. It is not encrypted: the key travels over your Wi-Fi, so use a network you trust.':
      'La page reste ouverte dix minutes, ou jusqu’à l’enregistrement. Elle n’est pas chiffrée : la clé passe par votre Wi-Fi, utilisez un réseau de confiance.',
    'The page has closed. Close this and try again.': 'La page s’est fermée. Fermez ceci et réessayez.',
    '%s   code %s': '%s   code %s',
    'Start': 'Démarrer',
    'Skip': 'Passer',
    'Clear': 'Effacer',
    'default: %s': 'par défaut : %s',
    'back to the default (241)': 'retour à la valeur par défaut (241)',
    'forget the code': 'oublier le code',
    'LG’s guide again': 'à nouveau le guide de LG',
    'The Input key.\nChoose Start, then press the Input button on your remote.':
      'La touche Entrée.\nChoisissez Démarrer, puis appuyez sur le bouton Input de votre télécommande.',
    'The Home key (optional).\nChoose Start, then press the Home button on your remote.':
      'La touche Accueil (facultative).\nChoisissez Démarrer, puis appuyez sur le bouton Home de votre télécommande.',
    'The voice button.\nChoose Start, then press the button you want to use for voice. The remote’s microphone button may not reach the hook; any spare button works.':
      'Le bouton voix.\nChoisissez Démarrer, puis appuyez sur le bouton à utiliser pour la voix. Le bouton micro peut ne pas atteindre le hook ; tout bouton libre convient.',
    'The Guide key.\nChoose Start, then press the Guide button on your remote. It then opens the Live TV channel guide instead of LG’s guide. Clear it to get LG’s guide back.':
      'La touche Guide.\nChoisissez Démarrer, puis appuyez sur le bouton Guide de votre télécommande. Il ouvre ensuite le guide de la TV en direct au lieu de celui de LG. Effacez-le pour retrouver le guide de LG.',
    'Done.\nInput key %s.\nThe Home key is optional: learn it from the main list if you want it recorded.':
      'Terminé.\nTouche Entrée %s.\nLa touche Accueil est facultative : apprenez-la depuis la liste principale si vous voulez l’enregistrer.',
    'Input key cleared.\nIt uses the default code (%s).': 'Touche Entrée effacée.\nElle utilise le code par défaut (%s).',
    'Voice button cleared.': 'Bouton voix effacé.',
    'Guide key cleared. LG’s guide is back.': 'Touche Guide effacée. Le guide de LG est de retour.',
    'Home key cleared.': 'Touche Accueil effacée.',
    'Press the %s button now…': 'Appuyez maintenant sur le bouton %s…',
    '%s key learned: code %s.': 'Touche %s apprise : code %s.',
    'Continue to the test': 'Passer au test',
    'The hook did not attach on this firmware, so keys cannot be learned. The Input key stays with LG’s picker.\nUse Share log to report this.':
      'Le hook ne s’est pas attaché sur ce firmware, les touches ne peuvent donc pas être apprises. La touche Entrée reste au sélecteur de LG.\nSignalez-le via Partager le journal.',
    'Nothing was pressed.': 'Rien n’a été appuyé.',
    'Try again': 'Réessayer',
    'Test.\nPress the Input button once more. Our Inputs list should open over this screen.':
      'Test.\nAppuyez encore une fois sur le bouton Input. Notre liste d’entrées doit s’ouvrir par-dessus cet écran.',
    'The Inputs list opened: the Input key works.': 'La liste d’entrées s’est ouverte : la touche Entrée fonctionne.',
    'Continue': 'Continuer',
    'The Inputs list did not open.\nIf LG’s own picker showed, the Input key is not mapped: learn it again or switch the Input key off.':
      'La liste d’entrées ne s’est pas ouverte.\nSi le sélecteur de LG est apparu, la touche Entrée n’est pas associée : apprenez-la à nouveau ou désactivez la touche Entrée.',
    'Learn again': 'Apprendre à nouveau',
    'Input': 'Input',
    'Home': 'Home',
    'Guide': 'Guide',
    'voice': 'voix',
    'The home screen you see. Updates come from GitHub releases and are checked against a SHA-256 file before they are installed. If a new launcher does not start, the previous one is put back.':
      'L’écran d’accueil que vous voyez. Les mises à jour viennent des versions GitHub et sont vérifiées avec un fichier SHA-256 avant l’installation. Si un nouveau launcher ne démarre pas, l’ancien est remis.',
    'The background service behind the launcher: Live TV, picture notifications, the Input key, these updates. A failed update restores the previous files.':
      'Le service en arrière-plan derrière le launcher : TV en direct, notifications avec image, touche Entrée, ces mises à jour. Une mise à jour ratée remet les fichiers précédents.',
    'Looks for a newer release on GitHub. Nothing is installed until you choose an update.':
      'Cherche une version plus récente sur GitHub. Rien n’est installé tant que vous ne choisissez pas une mise à jour.',
    'Stable releases are what most people want: at most one a day, made from the dev builds. Dev builds come with every change and can be less finished; choose Dev here, then use the Launcher and Service rows to install it. Going back to Stable offers the latest release again.':
      'Les versions stables sont ce que la plupart des gens veulent : au plus une par jour, faite à partir des versions dev. Les versions dev arrivent à chaque changement et peuvent être moins finies ; choisissez Dev ici, puis installez avec les lignes Launcher et Service. Revenir à Stable propose à nouveau la dernière version.',
    'Swaps the previous launcher version back in. The newer one stays available as an update.':
      'Remet la version précédente du launcher. La plus récente reste disponible comme mise à jour.',
    'Whether this launcher is Home, and learning the Home key.': 'Si ce launcher est l’accueil, et l’apprentissage de la touche Accueil.',
    'Stops LG’s ad, recommendation and telemetry services and blocks a few ad servers. Nothing is uninstalled, and it only applies while this launcher is Home.':
      'Arrête les services de publicité, de recommandation et de télémétrie de LG et bloque quelques serveurs publicitaires. Rien n’est désinstallé, et cela ne s’applique que tant que ce launcher est l’accueil.',
    'Stops LG’s ad, tracking, telemetry and suggestion services, in four groups you can switch separately. Nothing is uninstalled, and it only applies while this launcher is Home.':
      'Arrête les services de publicité, de suivi, de télémétrie et de suggestions de LG, en quatre groupes réglables séparément. Rien n’est désinstallé, et cela ne s’applique que tant que ce launcher est l’accueil.',
    'Keeps admanager and adoverlay-service from starting and points three LG ad servers at nothing in /etc/hosts.':
      'Empêche admanager et adoverlay-service de démarrer et fait pointer trois serveurs publicitaires de LG vers rien dans /etc/hosts.',
    'Keeps acr2 from starting: the service that recognises what is on screen (LG calls it LivePlus) and reports it.':
      'Empêche acr2 de démarrer : le service qui reconnaît ce qui est à l’écran (LG l’appelle LivePlus) et le signale.',
    'Stops remotelogger and service-logger, which collect logs and send them to LG.':
      'Arrête remotelogger et service-logger, qui collectent des journaux et les envoient à LG.',
    'Stops contentminer and nudge (recommendations and pop-up tips) and keeps sportsalarm from starting.':
      'Arrête contentminer et nudge (recommandations et astuces en pop-up) et empêche sportsalarm de démarrer.',
    'Switches every group on.': 'Active chaque groupe.',
    'Switches the debloat off: the services start again and the hosts lines are removed.':
      'Désactive le debloat : les services redémarrent et les lignes hosts sont retirées.',
    'Voice and network notifications.': 'Voix et notifications réseau.',
    'Your own photos behind Home: uploaded from a phone, or synced from Immich albums. Switch them on in the launcher: Customise > Wallpapers.':
      'Vos propres photos derrière l’accueil : envoyées depuis un téléphone ou synchronisées depuis des albums Immich. Activez-les dans le launcher : Personnaliser > Wallpapers.',
    'Shows a QR code. On the phone page you upload photos (they are made the right size on the phone), delete uploads, connect Immich, choose albums and hide single photos.':
      'Affiche un code QR. Sur la page du téléphone, vous envoyez des photos (mises à la bonne taille sur le téléphone), supprimez des envois, connectez Immich, choisissez des albums et masquez des photos.',
    'Photos uploaded from a phone, kept on the TV. At most 100.':
      'Photos envoyées depuis un téléphone, gardées sur le téléviseur. 100 au plus.',
    'Photos from the Immich albums you chose, downloaded to the TV every six hours (and with Sync now), so Home never waits for Immich. At most 300.':
      'Photos des albums Immich choisis, téléchargées sur le téléviseur toutes les six heures (et avec Synchroniser maintenant), pour que l’accueil n’attende jamais Immich. 300 au plus.',
    'Every photo Wallpapers can show, and the space they use on the TV (at most 150 MB).':
      'Toutes les photos que Wallpapers peut afficher, et l’espace qu’elles occupent sur le téléviseur (150 Mo au plus).',
    'Downloads new and changed photos from the chosen albums now and removes the ones that left them.':
      'Télécharge maintenant les photos nouvelles et modifiées des albums choisis et retire celles qui en sont sorties.',
    'Deletes every uploaded photo from the TV. Immich photos stay.':
      'Supprime toutes les photos envoyées du téléviseur. Les photos Immich restent.',
    'Forgets the address and the key and deletes the Immich photos from the TV. Uploads stay.':
      'Oublie l’adresse et la clé et supprime les photos Immich du téléviseur. Les envois restent.',
    'Puts the dock, the top buttons, hidden apps, the app order and the clock back to the defaults. The theme stays.':
      'Remet le dock, les boutons du haut, les apps masquées, l’ordre et l’horloge aux réglages par défaut. Le thème reste.',
    'The launcher’s own settings go back to the defaults. Apps, the theme and everything in this app stay.':
      'Les réglages propres du launcher reviennent aux valeurs par défaut. Les apps, le thème et tout ce qui est dans cette app restent.',
    'On: the Home button opens this launcher. Off: LG’s own Home. Switching restarts the TV (about a minute); the service keeps running either way.':
      'Activé : le bouton Accueil ouvre ce launcher. Désactivé : l’accueil de LG. Changer redémarre le téléviseur (environ une minute) ; le service continue de tourner dans les deux cas.',
    'Lets other devices on your network send picture notifications to this TV with a POST request and a secret token. Off by default.':
      'Permet à d’autres appareils de votre réseau d’envoyer des notifications avec image à ce téléviseur par une requête POST et un jeton secret. Désactivé par défaut.',
    'On: the TV listens on port 8767 for POST /notify with the token. Anyone who has the token and network access can show cards on this screen.':
      'Activé : le téléviseur écoute sur le port 8767 les POST /notify avec le jeton. Quiconque a le jeton et accès au réseau peut afficher des cartes sur cet écran.',
    'Shows the address, the token and an example request.': 'Affiche l’adresse, le jeton et un exemple de requête.',
    'Shows a QR code. A phone that scans it opens a page, served by the TV for ten minutes, that shows the notification address and the token with Copy buttons (for Home Assistant, for example). The token is a secret.':
      'Affiche un code QR. Un téléphone qui le scanne ouvre une page servie dix minutes par le téléviseur, avec l’adresse de notification et le jeton et des boutons Copier (pour Home Assistant, par exemple). Le jeton est secret.',
    'Creates a new secret token. Devices using the old one stop working.':
      'Crée un nouveau jeton secret. Les appareils utilisant l’ancien ne fonctionnent plus.',
    'Optional. Speak into the remote and the TV turns it into text on the TV itself (Moonshine, English). The text can be sent to a server you run. Audio never leaves the TV. Needs a download of about 80 MB.':
      'Facultatif. Parlez dans la télécommande et le téléviseur transforme la voix en texte sur l’appareil (Moonshine, anglais). Le texte peut aller vers votre serveur. L’audio ne quitte jamais le téléviseur. Nécessite un téléchargement d’environ 80 Mo.',
    'Downloads the speech engine, a 64-bit C library and the model (checksums are verified), then tests them. About a minute. Nothing is installed in the system folders.':
      'Télécharge le moteur vocal, une bibliothèque C 64 bits et le modèle (sommes de contrôle vérifiées), puis les teste. Environ une minute. Rien n’est installé dans les dossiers système.',
    'On: pressing the button you learned starts listening. A card shows what was heard.':
      'Activé : appuyer sur le bouton appris lance l’écoute. Une carte montre ce qui a été entendu.',
    'On: what you say is also sent as text to a language model through OpenRouter and the answer is shown on screen. Needs your OpenRouter key; the text goes to OpenRouter and the model provider, never audio.':
      'Activé : ce que vous dites est aussi envoyé en texte à un modèle de langage via OpenRouter et la réponse s’affiche. Nécessite votre clé OpenRouter ; le texte va à OpenRouter et au fournisseur du modèle, jamais l’audio.',
    'Shows a QR code. Scan it with a phone on the same Wi-Fi to enter your OpenRouter key, choose a model, write instructions and set a server address. Nothing is typed on the TV.':
      'Affiche un code QR. Scannez-le avec un téléphone sur le même Wi-Fi pour saisir votre clé OpenRouter, choisir un modèle, écrire des instructions et définir une adresse de serveur. Rien n’est tapé sur le téléviseur.',
    'Choose the model that answers. The list is read from OpenRouter: the newest models of the main providers, with the price per million words in. The phone page lists every model.':
      'Choisissez le modèle qui répond. La liste vient d’OpenRouter : les modèles les plus récents des grands fournisseurs, avec le prix par million de mots en entrée. La page du téléphone liste tous les modèles.',
    'Shows the commands to set the key, model and instructions from a shell, and how to ask by text.':
      'Affiche les commandes pour définir la clé, le modèle et les instructions depuis un shell, et comment poser une question par texte.',
    'The AI and Home Assistant remember the last turns for ten minutes. This clears them.':
      'L’IA et Home Assistant retiennent les derniers échanges dix minutes. Ceci les efface.',
    'Sends what you say as text to Home Assistant’s Assist and shows its answer. Needs the address and a long-lived access token (Home Assistant profile page), entered on your phone. Choosing this row tests the connection.':
      'Envoie ce que vous dites en texte à Assist de Home Assistant et affiche sa réponse. Nécessite l’adresse et un jeton d’accès longue durée (page de profil de Home Assistant), saisis sur votre téléphone. Choisir cette ligne teste la connexion.',
    'Home Assistant first, then the AI: Assist gets the text; if it does not understand, the AI answers. Home Assistant only: never the AI. The AI only: Home Assistant is not asked. Choose to switch.':
      'D’abord Home Assistant, puis l’IA : Assist reçoit le texte ; s’il ne comprend pas, l’IA répond. Home Assistant seulement : jamais l’IA. L’IA seulement : Home Assistant n’est pas interrogé. Choisissez pour changer.',
    'Which Home Assistant conversation agent answers. The default is the built-in one; others (for example a language-model agent) are listed from your Home Assistant.':
      'Quel agent de conversation de Home Assistant répond. Par défaut, celui intégré ; les autres (par exemple un agent à modèle de langage) viennent de votre Home Assistant.',
    'LG’s own assistant reacts to the same button and sends the audio to LG. On: it is paused while voice is on. A reboot or switching this off undoes it.':
      'L’assistant de LG réagit au même bouton et envoie l’audio à LG. Activé : il est en pause tant que la voix est active. Un redémarrage ou la désactivation annule cela.',
    'Records the code of the remote button that starts listening. Try the microphone button first; any spare button works.':
      'Enregistre le code du bouton qui lance l’écoute. Essayez d’abord le bouton micro ; tout bouton libre convient.',
    'Starts listening without the button: speak when the card appears.': 'Lance l’écoute sans le bouton : parlez quand la carte apparaît.',
    'Where the recognised text goes. Shows how to set the address of your server. Without one, the text is only shown on screen.':
      'Où va le texte reconnu. Montre comment définir l’adresse de votre serveur. Sans serveur, le texte est seulement affiché.',
    'Deletes the downloaded engine and model. The rest of CleanYourTV is not affected.':
      'Supprime le moteur et le modèle téléchargés. Le reste de CleanYourTV n’est pas touché.',
    'The remote’s Input button opens our Inputs list over the running app instead of LG’s picker. Open this screen to switch it off or to learn the button.':
      'Le bouton Input de la télécommande ouvre notre liste d’entrées par-dessus l’app en cours au lieu du sélecteur de LG. Ouvrez cet écran pour le désactiver ou apprendre le bouton.',
    'Shows a QR code. Scan it with a phone on the same Wi-Fi to copy a report for a bug report. Addresses and URL paths are masked; the page closes after ten minutes.':
      'Affiche un code QR. Scannez-le avec un téléphone sur le même Wi-Fi pour copier un rapport pour signaler un bug. Adresses et chemins d’URL sont masqués ; la page se ferme après dix minutes.',
    'Removes the apps, the boot scripts and your settings, then restarts the TV so LG’s Home comes back.':
      'Supprime les apps, les scripts de démarrage et vos réglages, puis redémarre le téléviseur pour que l’accueil de LG revienne.',
    'On: pressing Input shows our Inputs list. Off: LG’s picker comes back at once.':
      'Activé : Input affiche notre liste d’entrées. Désactivé : le sélecteur de LG revient aussitôt.',
    'Reads the code of your remote’s Input button from the hook, then tests that our list opens. The default is 241. Clear goes back to it.':
      'Lit le code du bouton Input de votre télécommande depuis le hook, puis vérifie que notre liste s’ouvre. Par défaut 241. Effacer y revient.',
    'Settings for Live TV: switch it on or off, set up or remove your playlist, refresh the guide and learn the Guide key.':
      'Réglages de la TV en direct : l’activer ou non, configurer ou supprimer votre playlist, actualiser le guide et apprendre la touche Guide.',
    'On: the launcher has a Live TV button and tile, the Inputs list has Live TV, and the Guide key can open the channel guide. Off: all of that is hidden and LG’s own player and guide are used. Your playlist is kept.':
      'Activé : le launcher a un bouton et une tuile TV en direct, la liste d’entrées a la TV en direct, et la touche Guide peut ouvrir le guide. Désactivé : tout cela est masqué et le lecteur et le guide de LG sont utilisés. Votre playlist est conservée.',
    'Your M3U playlist and its XMLTV guide. Choose it to set up: a QR code opens a page on your phone where you enter the playlist address and the 6-digit code shown here.':
      'Votre playlist M3U et son guide XMLTV. Choisissez-la pour configurer : un code QR ouvre une page sur votre téléphone où vous saisissez l’adresse de la playlist et le code à 6 chiffres affiché ici.',
    'Downloads the playlist and the programme guide again now. It also happens twice a day.':
      'Télécharge à nouveau la playlist et le guide des programmes maintenant. Cela se fait aussi deux fois par jour.',
    'Empties the Recent tab and the list of channels that failed. Favourites stay.':
      'Vide l’onglet Récents et la liste des chaînes en échec. Les favoris restent.',
    'Deletes the playlist address, the channel list, the guide and your favourites from the TV.':
      'Supprime du téléviseur l’adresse de la playlist, la liste des chaînes, le guide et vos favoris.',
    'Deletes the playlist and everything stored for it on the TV. You can set it up again.':
      'Supprime la playlist et tout ce qui est gardé pour elle sur le téléviseur. Vous pouvez la reconfigurer.',
    'Records the Guide button’s code. Afterwards it opens the Live TV channel guide over whatever is running (only while Live TV is on). Clear it to get LG’s guide back.':
      'Enregistre le code du bouton Guide. Ensuite, il ouvre le guide de la TV en direct par-dessus ce qui tourne (seulement si la TV en direct est activée). Effacez-le pour retrouver le guide de LG.',
    'How the Input button shows the Inputs. Over the running app, ready in the background: instant, tested on webOS 25. Over the running app, started when pressed: nothing runs hidden, so it cannot keep the remote; the default on older webOS, where the background one showed a loading circle. The launcher’s Inputs list: the TV goes to our Home (needs CleanYourTV as Home; otherwise the key stays with LG). Choose to go to the next one.':
      'Comment le bouton Input affiche les entrées. Par-dessus l’app en cours, prête en arrière-plan : instantané, testé sur webOS 25. Par-dessus l’app en cours, lancée à l’appui : rien ne tourne en caché, elle ne peut donc pas garder la télécommande ; le choix par défaut sur les anciens webOS, où la version en arrière-plan affichait un cercle de chargement. La liste d’entrées du launcher : le téléviseur va sur notre accueil (nécessite CleanYourTV comme accueil ; sinon la touche reste à LG). Choisissez pour passer à la suivante.',
    'Optional. Records the Home button’s code. The Home key keeps working exactly as before.':
      'Facultatif. Enregistre le code du bouton Home. Le bouton Home fonctionne exactement comme avant.',
    'Back to the previous list.': 'Retour à la liste précédente.',
    'Nothing changes.': 'Rien ne change.',
    'Deletes the apps, the boot scripts and the settings, then restarts the TV.':
      'Supprime les apps, les scripts de démarrage et les réglages, puis redémarre le téléviseur.',
    'Restarts the TV; this launcher is Home after it starts.': 'Redémarre le téléviseur ; ce launcher est ensuite l’accueil.',
    'Restarts the TV; LG’s own Home is Home after it starts. You can switch back here.':
      'Redémarre le téléviseur ; l’accueil de LG est ensuite l’accueil. Vous pouvez revenir ici.',
    'A newer package is available. Install it before the setup: it may contain fixes for your firmware.':
      'Un paquet plus récent est disponible. Installez-le avant la configuration : il peut contenir des correctifs pour votre firmware.',
    'The remote’s Input button opens our Inputs list instead of LG’s picker. You can change this later.':
      'Le bouton Input de la télécommande ouvre notre liste d’entrées au lieu du sélecteur de LG. Vous pouvez le changer plus tard.',
    'Installs the launcher, replaces LG’s Home at boot and starts the service. About a minute; the screen blinks once. If the new Home does not come up, the setup removes itself and restarts the TV.':
      'Installe le launcher, remplace l’accueil de LG au démarrage et lance le service. Environ une minute ; l’écran clignote une fois. Si le nouvel accueil ne démarre pas, la configuration se retire et redémarre le téléviseur.',
    'Your firmware is not in the compatibility list and LG’s Home looks different. This tries it anyway; a failed start restarts the TV with LG’s Home.':
      'Votre firmware n’est pas dans la liste de compatibilité et l’accueil de LG est différent. Ceci essaie quand même ; un démarrage raté redémarre le téléviseur avec l’accueil de LG.',
    'Works without the service: looks for a newer package and installs it through the root service.':
      'Fonctionne sans le service : cherche un paquet plus récent et l’installe via le service root.',
    'This TV also has LG’s full-screen Home: if the Home button opens that instead of this launcher, set TV Settings > General > Home Settings > Home Style to Basic.':
      'Ce téléviseur a aussi l’accueil plein écran de LG : si le bouton Home l’ouvre au lieu de ce launcher, réglez Paramètres > Général > Paramètres de l’accueil > Style d’accueil sur Basique.',
    '4K (the default) keeps photos at 3840 pixels, the size the TV draws Home at, so they look sharp; Full HD at 1920 fits about four times as many photos in 150 MB. It applies to new uploads and to the next Immich sync.':
      '4K (par défaut) garde les photos à 3840 pixels, la taille à laquelle le téléviseur dessine l’accueil, pour qu’elles soient nettes ; Full HD à 1920 en fait tenir environ quatre fois plus dans 150 Mo. S’applique aux nouveaux envois et à la prochaine synchronisation Immich.',
  },
  'es': {
    'Close': 'Cerrar',
    'Back': 'Atrás',
    'Cancel': 'Cancelar',
    'On': 'Activado',
    'Off': 'Desactivado',
    'selected': 'elegido',
    'default': 'predeterminado',
    'never': 'nunca',
    'just now': 'ahora mismo',
    '%d min ago': 'hace %d min',
    '%d h ago': 'hace %d h',
    '%d days ago': 'hace %d días',
    'Launcher %s': 'Launcher %s',
    'Service %s': 'Servicio %s',
    'Update to %s': 'Actualizar a %s',
    'Update to %s (dev build)': 'Actualizar a %s (versión dev)',
    'Checking…': 'Comprobando…',
    'No release yet': 'Aún no hay versión',
    'Cannot check': 'No se puede comprobar',
    'Up to date': 'Actualizado',
    'Check for updates': 'Buscar actualizaciones',
    'Update channel': 'Canal de actualización',
    'Stable releases': 'Versiones estables',
    'Dev builds': 'Versiones dev',
    'a release a day at most': 'como máximo una versión al día',
    'every change': 'cada cambio',
    'build %s': 'versión %s',
    'none published right now': 'ninguna publicada ahora',
    'Go back to launcher %s': 'Volver al launcher %s',
    'Where updates come from': 'De dónde vienen las actualizaciones',
    'Looking for the dev build…': 'Buscando la versión dev…',
    'Switching…': 'Cambiando…',
    'Back on the stable releases': 'De vuelta a las versiones estables',
    'Following the dev builds. If the Launcher or Service row offers an update, that is the dev build.':
      'Se siguen las versiones dev. Si la fila Launcher o Servicio ofrece una actualización, es la versión dev.',
    'Latest release %s': 'Última versión %s',
    'Updates: %s': 'Actualizaciones: %s',
    'Launcher %s · service %s': 'Launcher %s · servicio %s',
    'CleanYourTV as Home': 'CleanYourTV como Inicio',
    'Live TV': 'TV en directo',
    'Wallpapers': 'Wallpapers',
    'Input key': 'Botón Entrada',
    'not available': 'no disponible',
    'Debloat': 'Debloat',
    '%d of %d on': '%d de %d activados',
    'More': 'Más',
    'voice, network notifications': 'voz, notificaciones de red',
    'Share log': 'Compartir el registro',
    'QR code for your phone': 'código QR para tu móvil',
    'Reset Home customisation': 'Restablecer la personalización de Inicio',
    'Uninstall': 'Desinstalar',
    '%d photos': '%d fotos',
    'Use CleanYourTV as Home': 'Usar CleanYourTV como Inicio',
    'switching restarts the TV': 'cambiar reinicia el televisor',
    'Learn the Home key': 'Aprender el botón Inicio',
    'optional': 'opcional',
    'now: %s': 'ahora: %s',
    'not learned': 'no aprendido',
    'Switch Home?': '¿Cambiar Inicio?',
    'Yes, use CleanYourTV as Home': 'Sí, usar CleanYourTV como Inicio',
    'Yes, use LG’s Home': 'Sí, usar el Inicio de LG',
    'the TV restarts': 'el televisor se reinicia',
    'Switching to CleanYourTV… the TV restarts in a moment.': 'Cambiando a CleanYourTV… el televisor se reinicia en un momento.',
    'Switching to LG’s Home… the TV restarts in a moment.': 'Cambiando al Inicio de LG… el televisor se reinicia en un momento.',
    'Remove CleanYourTV?': '¿Quitar CleanYourTV?',
    'Yes, remove CleanYourTV': 'Sí, quitar CleanYourTV',
    'settings and apps are deleted; the TV restarts': 'se borran los ajustes y las apps; el televisor se reinicia',
    'Removing CleanYourTV… the TV restarts in a moment and LG’s Home comes back.':
      'Quitando CleanYourTV… el televisor se reinicia en un momento y vuelve el Inicio de LG.',
    'Yes, reset Home': 'Sí, restablecer Inicio',
    'dock, top buttons, hidden apps, app order and clock go back to the defaults':
      'dock, botones superiores, apps ocultas, orden y reloj vuelven a los valores predeterminados',
    'Home is back to the defaults. Open Home to see it.': 'Inicio ha vuelto a los valores predeterminados. Abre Inicio para verlo.',
    'Live TV: your own playlist': 'TV en directo: tu propia lista',
    'Show Live TV': 'Mostrar TV en directo',
    'Playlist': 'Lista',
    '%d channels': '%d canales',
    'guide for %d programmes': 'guía de %d programas',
    'not set': 'sin configurar',
    'set up from your phone': 'configurar desde tu móvil',
    'Refresh playlist and guide': 'Actualizar lista y guía',
    'Refreshing…': 'Actualizando…',
    'Refreshing in the background': 'Actualizando en segundo plano',
    'Learn the Guide key': 'Aprender el botón Guía',
    'LG’s guide stays': 'se mantiene la guía de LG',
    'Live TV is off': 'La TV en directo está desactivada',
    'Clear recent channels': 'Borrar canales recientes',
    'Recent channels cleared': 'Canales recientes borrados',
    'Remove the playlist': 'Quitar la lista',
    'nothing to remove': 'nada que quitar',
    'Remove the playlist?': '¿Quitar la lista?',
    'Yes, remove the playlist': 'Sí, quitar la lista',
    'the address, the channel list, the guide and your favourites are deleted':
      'se borran la dirección, la lista de canales, la guía y tus favoritos',
    'No, keep it': 'No, mantenerla',
    'Playlist removed': 'Lista quitada',
    'Playlist saved': 'Lista guardada',
    'Input key opens our Inputs list': 'El botón Entrada abre nuestra lista de entradas',
    'not available on this firmware': 'no disponible en este firmware',
    'Learn the Input key': 'Aprender el botón Entrada',
    'default (%s)': 'predeterminado (%s)',
    'learned: %s': 'aprendido: %s',
    'Input key shows': 'El botón Entrada muestra',
    'over the running app, ready in the background (instant)': 'sobre la app en uso, lista en segundo plano (al instante)',
    'over the running app, started when pressed': 'sobre la app en uso, se inicia al pulsar',
    'the launcher’s Inputs list': 'la lista de entradas del launcher',
    'LG’s own list: CleanYourTV is not the Home': 'la lista de LG: CleanYourTV no es el Inicio',
    'Ads': 'Anuncios',
    'Viewing tracking (LivePlus)': 'Seguimiento de lo que ves (LivePlus)',
    'Telemetry logs': 'Registros de telemetría',
    'Suggestions and nudges': 'Sugerencias y avisos',
    'ad services and ad servers': 'servicios y servidores de anuncios',
    'Switch all on': 'Activar todo',
    'Switch all off': 'Desactivar todo',
    'Debloat LG’s ads and telemetry': 'Quitar los anuncios y la telemetría de LG',
    'Voice': 'Voz',
    'not installed': 'no instalado',
    'Network notifications': 'Notificaciones de red',
    'Install voice': 'Instalar voz',
    'installing…': 'instalando…',
    'downloads about 80 MB': 'descarga unos 80 MB',
    'Listen on the voice button': 'Escuchar con el botón de voz',
    'learn a button first': 'aprende primero un botón',
    'Learn the voice button': 'Aprender el botón de voz',
    'Try it now': 'Probar ahora',
    'listening…': 'escuchando…',
    'speak when the card appears': 'habla cuando aparezca la tarjeta',
    'Speak now…': 'Habla ahora…',
    'Listening…': 'Escuchando…',
    'Switch off LG’s voice assistant': 'Desactivar el asistente de voz de LG',
    'not paused yet': 'aún no en pausa',
    'Home Assistant (Assist)': 'Home Assistant (Assist)',
    'Which answers first': 'Quién responde primero',
    'Home Assistant first, then the AI': 'Primero Home Assistant, luego la IA',
    'Home Assistant only': 'Solo Home Assistant',
    'The AI only': 'Solo la IA',
    'Assist agent': 'Agente de Assist',
    'set up Home Assistant first': 'configura primero Home Assistant',
    'AI chat (OpenRouter)': 'Chat de IA (OpenRouter)',
    'no key set': 'sin clave',
    'Model': 'Modelo',
    'Send the text to': 'Enviar el texto a',
    'not set · shows a card only': 'sin configurar · solo muestra una tarjeta',
    'Set up from your phone': 'Configurar desde tu móvil',
    'key, model, Home Assistant, server': 'clave, modelo, Home Assistant, servidor',
    'Set up with commands': 'Configurar con comandos',
    'for scripts and ssh': 'para scripts y ssh',
    'Forget the conversation': 'Olvidar la conversación',
    'Conversation cleared': 'Conversación borrada',
    'Remove voice': 'Quitar la voz',
    'deletes the %d MB download': 'borra la descarga de %d MB',
    'Voice removed': 'Voz quitada',
    'Default agent': 'Agente predeterminado',
    'Home Assistant’s own': 'el de Home Assistant',
    'Choose the model that answers': 'Elige el modelo que responde',
    'Choose the Home Assistant agent': 'Elige el agente de Home Assistant',
    'Loading the model list…': 'Cargando la lista de modelos…',
    'Asking Home Assistant…': 'Preguntando a Home Assistant…',
    'Connected to %s': 'Conectado a %s',
    'Agent: %s': 'Agente: %s',
    'Model: %s': 'Modelo: %s',
    'Saved': 'Guardado',
    'Voice · %s': 'Voz · %s',
    'Last heard: “%s”': 'Último oído: «%s»',
    'Last try: %s': 'Último intento: %s',
    'Accept notifications from the network': 'Aceptar notificaciones de la red',
    'How to send': 'Cómo enviar',
    'address, token, example': 'dirección, token, ejemplo',
    'Show as QR code': 'Mostrar como código QR',
    'scan with a phone to copy the address and token': 'escanea con el móvil para copiar la dirección y el token',
    'New token': 'Nuevo token',
    'the old one stops working': 'el anterior deja de funcionar',
    'New token created. Open “How to send” to see it.': 'Nuevo token creado. Abre «Cómo enviar» para verlo.',
    'Switch notifications on first': 'Activa primero las notificaciones',
    'Manage from your phone': 'Gestionar desde tu móvil',
    'upload photos, configure Immich': 'subir fotos, configurar Immich',
    'Local uploads': 'Subidas locales',
    'Immich': 'Immich',
    'not connected': 'no conectado',
    'syncing… %d new': 'sincronizando… %d nuevas',
    'synced %s': 'sincronizado %s',
    'Total': 'Total',
    '%d of 150 MB': '%d de 150 MB',
    'Sync now': 'Sincronizar ahora',
    'syncing…': 'sincronizando…',
    'Immich: new and changed photos': 'Immich: fotos nuevas y cambiadas',
    'connect Immich first': 'conecta primero Immich',
    'Syncing with Immich…': 'Sincronizando con Immich…',
    'Picture size': 'Tamaño de imagen',
    'Full HD (1920 px)': 'Full HD (1920 px)',
    '4K (3840 px)': '4K (3840 px)',
    'Remove all uploads': 'Quitar todas las subidas',
    'Disconnect Immich': 'Desconectar Immich',
    'Yes, remove all uploads': 'Sí, quitar todas las subidas',
    'Yes, disconnect Immich': 'Sí, desconectar Immich',
    'the uploaded photos are deleted from the TV': 'las fotos subidas se borran del televisor',
    'the key is forgotten and its photos are deleted from the TV': 'se olvida la clave y sus fotos se borran del televisor',
    'Uploads removed': 'Subidas quitadas',
    'Immich disconnected': 'Immich desconectado',
    'Take over the Input key': 'Tomar el botón Entrada',
    'Set up now': 'Configurar ahora',
    'the screen blinks once': 'la pantalla parpadea una vez',
    'Set up anyway': 'Configurar de todos modos',
    'untested firmware; a failed start restarts the TV': 'firmware no probado; un inicio fallido reinicia el televisor',
    'works without the service': 'funciona sin el servicio',
    'recommended first · installed %s': 'recomendado primero · instalada %s',
    'The service is not running. Set it up to replace LG’s Home, take over the Input key and keep everything up to date.':
      'El servicio no está en marcha. Configúralo para sustituir el Inicio de LG, tomar el botón Entrada y mantener todo actualizado.',
    'Checking for updates…': 'Buscando actualizaciones…',
    'Could not check: %s': 'No se pudo comprobar: %s',
    'no answer': 'sin respuesta',
    'Updating to %s…': 'Actualizando a %s…',
    'Update failed: %s': 'Error al actualizar: %s',
    'The update is taking too long. Log: /tmp/cytv-selfupdate.log on the TV.':
      'La actualización tarda demasiado. Registro: /tmp/cytv-selfupdate.log en el televisor.',
    'Updating… %s': 'Actualizando… %s',
    'Setting up… the screen blinks once while LG’s system restarts':
      'Configurando… la pantalla parpadea una vez mientras se reinicia el sistema de LG',
    'Setting up… %s': 'Configurando… %s',
    'Waiting for the service…': 'Esperando al servicio…',
    'The service did not answer': 'El servicio no respondió',
    'The service did not answer.': 'El servicio no respondió.',
    'Reading status…': 'Leyendo el estado…',
    'Preparing…': 'Preparando…',
    'Share the log': 'Compartir el registro',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Tap <b>Copy</b> on the page and paste it into your message.</li>':
      '<li>Móvil en la <b>misma wifi</b> que el televisor.</li><li>Escanea el código con la cámara.</li><li>Toca <b>Copiar</b> en la página y pégalo en tu mensaje.</li>',
    'Preparing the report…': 'Preparando el informe…',
    'The page is open for ten minutes. It lists versions, the setup log and the service log; addresses and URL paths are masked.':
      'La página está abierta diez minutos. Muestra las versiones, el registro de instalación y el del servicio; direcciones y rutas de URL están ocultas.',
    'Could not prepare the report (is the Homebrew Channel installed?).':
      'No se pudo preparar el informe (¿está instalado el Homebrew Channel?).',
    'Notification address and token': 'Dirección y token de notificación',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera and open the page: it shows the address and the token with <b>Copy</b> buttons.</li><li>The token is a <b>secret</b>: anyone who sees this code while it is open can read it.</li>':
      '<li>Móvil en la <b>misma wifi</b> que el televisor.</li><li>Escanea el código y abre la página: muestra la dirección y el token con botones <b>Copiar</b>.</li><li>El token es <b>secreto</b>: cualquiera que vea este código mientras está abierto puede leerlo.</li>',
    'The notification listener is not running.': 'La escucha de notificaciones no está en marcha.',
    'The page opens for ten minutes. It is not encrypted: the token travels over your Wi-Fi, so use a network you trust.':
      'La página se abre diez minutos. No está cifrada: el token viaja por tu wifi, así que usa una red de confianza.',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Choose <b>Upload photos</b> or <b>Configure Immich</b>.</li>':
      '<li>Móvil en la <b>misma wifi</b> que el televisor.</li><li>Escanea el código con la cámara.</li><li>Elige <b>Upload photos</b> o <b>Configure Immich</b>.</li>',
    'The page stays open while you use it, at most an hour. It is not encrypted: your photos and the Immich key travel over your Wi-Fi.':
      'La página sigue abierta mientras la usas, como máximo una hora. No está cifrada: tus fotos y la clave de Immich viajan por tu wifi.',
    'Set up Live TV': 'Configurar TV en directo',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Enter the <b>code</b> below and your playlist address.</li>':
      '<li>Móvil en la <b>misma wifi</b> que el televisor.</li><li>Escanea el código con la cámara.</li><li>Introduce el <b>código</b> de abajo y la dirección de tu lista.</li>',
    'The page stays open for ten minutes. It is not encrypted: the playlist address, which may hold an access key, travels over your Wi-Fi.':
      'La página sigue abierta diez minutos. No está cifrada: la dirección de la lista, que puede incluir una clave de acceso, viaja por tu wifi.',
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Enter your <b>OpenRouter key</b> and model, or your <b>Home Assistant</b> address and access token, and tap <b>Save</b>.</li>':
      '<li>Móvil en la <b>misma wifi</b> que el televisor.</li><li>Escanea el código con la cámara.</li><li>Introduce tu <b>clave de OpenRouter</b> y el modelo, o la dirección y el token de <b>Home Assistant</b>, y toca <b>Save</b>.</li>',
    'The page stays open for ten minutes, or until you save. It is not encrypted: the key travels over your Wi-Fi, so use a network you trust.':
      'La página sigue abierta diez minutos o hasta que guardes. No está cifrada: la clave viaja por tu wifi, así que usa una red de confianza.',
    'The page has closed. Close this and try again.': 'La página se ha cerrado. Cierra esto y vuelve a intentarlo.',
    '%s   code %s': '%s   código %s',
    'Start': 'Empezar',
    'Skip': 'Omitir',
    'Clear': 'Borrar',
    'default: %s': 'predeterminado: %s',
    'back to the default (241)': 'volver al predeterminado (241)',
    'forget the code': 'olvidar el código',
    'LG’s guide again': 'de nuevo la guía de LG',
    'The Input key.\nChoose Start, then press the Input button on your remote.':
      'El botón Entrada.\nElige Empezar y pulsa el botón Input del mando.',
    'The Home key (optional).\nChoose Start, then press the Home button on your remote.':
      'El botón Inicio (opcional).\nElige Empezar y pulsa el botón Home del mando.',
    'The voice button.\nChoose Start, then press the button you want to use for voice. The remote’s microphone button may not reach the hook; any spare button works.':
      'El botón de voz.\nElige Empezar y pulsa el botón que quieras usar para la voz. Puede que el botón del micrófono no llegue al hook; vale cualquier botón libre.',
    'The Guide key.\nChoose Start, then press the Guide button on your remote. It then opens the Live TV channel guide instead of LG’s guide. Clear it to get LG’s guide back.':
      'El botón Guía.\nElige Empezar y pulsa el botón Guide del mando. Después abrirá la guía de TV en directo en lugar de la de LG. Bórralo para recuperar la guía de LG.',
    'Done.\nInput key %s.\nThe Home key is optional: learn it from the main list if you want it recorded.':
      'Listo.\nBotón Entrada %s.\nEl botón Inicio es opcional: apréndelo desde la lista principal si quieres guardarlo.',
    'Input key cleared.\nIt uses the default code (%s).': 'Botón Entrada borrado.\nUsa el código predeterminado (%s).',
    'Voice button cleared.': 'Botón de voz borrado.',
    'Guide key cleared. LG’s guide is back.': 'Botón Guía borrado. Vuelve la guía de LG.',
    'Home key cleared.': 'Botón Inicio borrado.',
    'Press the %s button now…': 'Pulsa ahora el botón %s…',
    '%s key learned: code %s.': 'Botón %s aprendido: código %s.',
    'Continue to the test': 'Continuar con la prueba',
    'The hook did not attach on this firmware, so keys cannot be learned. The Input key stays with LG’s picker.\nUse Share log to report this.':
      'El hook no se conectó en este firmware, así que no se pueden aprender botones. El botón Entrada sigue con el selector de LG.\nInfórmalo con Compartir el registro.',
    'Nothing was pressed.': 'No se pulsó nada.',
    'Try again': 'Reintentar',
    'Test.\nPress the Input button once more. Our Inputs list should open over this screen.':
      'Prueba.\nPulsa una vez más el botón Input. Nuestra lista de entradas debería abrirse sobre esta pantalla.',
    'The Inputs list opened: the Input key works.': 'Se abrió la lista de entradas: el botón Entrada funciona.',
    'Continue': 'Continuar',
    'The Inputs list did not open.\nIf LG’s own picker showed, the Input key is not mapped: learn it again or switch the Input key off.':
      'No se abrió la lista de entradas.\nSi apareció el selector de LG, el botón Entrada no está asignado: apréndelo de nuevo o desactiva el botón Entrada.',
    'Learn again': 'Aprender de nuevo',
    'Input': 'Input',
    'Home': 'Home',
    'Guide': 'Guide',
    'voice': 'voz',
    'The home screen you see. Updates come from GitHub releases and are checked against a SHA-256 file before they are installed. If a new launcher does not start, the previous one is put back.':
      'La pantalla de inicio que ves. Las actualizaciones vienen de las versiones de GitHub y se comprueban con un archivo SHA-256 antes de instalarse. Si un launcher nuevo no arranca, vuelve el anterior.',
    'The background service behind the launcher: Live TV, picture notifications, the Input key, these updates. A failed update restores the previous files.':
      'El servicio en segundo plano tras el launcher: TV en directo, notificaciones con imagen, el botón Entrada, estas actualizaciones. Una actualización fallida restaura los archivos anteriores.',
    'Looks for a newer release on GitHub. Nothing is installed until you choose an update.':
      'Busca una versión más nueva en GitHub. No se instala nada hasta que elijas una actualización.',
    'Stable releases are what most people want: at most one a day, made from the dev builds. Dev builds come with every change and can be less finished; choose Dev here, then use the Launcher and Service rows to install it. Going back to Stable offers the latest release again.':
      'Las versiones estables son lo que quiere la mayoría: como mucho una al día, hecha a partir de las versiones dev. Las versiones dev llegan con cada cambio y pueden estar menos acabadas; elige Dev aquí e instala con las filas Launcher y Servicio. Volver a Estable ofrece de nuevo la última versión.',
    'Swaps the previous launcher version back in. The newer one stays available as an update.':
      'Vuelve a poner la versión anterior del launcher. La más nueva sigue disponible como actualización.',
    'Whether this launcher is Home, and learning the Home key.': 'Si este launcher es el Inicio, y aprender el botón Inicio.',
    'Stops LG’s ad, recommendation and telemetry services and blocks a few ad servers. Nothing is uninstalled, and it only applies while this launcher is Home.':
      'Detiene los servicios de anuncios, recomendaciones y telemetría de LG y bloquea algunos servidores de anuncios. No se desinstala nada, y solo se aplica mientras este launcher es el Inicio.',
    'Stops LG’s ad, tracking, telemetry and suggestion services, in four groups you can switch separately. Nothing is uninstalled, and it only applies while this launcher is Home.':
      'Detiene los servicios de anuncios, seguimiento, telemetría y sugerencias de LG, en cuatro grupos que puedes activar por separado. No se desinstala nada, y solo se aplica mientras este launcher es el Inicio.',
    'Keeps admanager and adoverlay-service from starting and points three LG ad servers at nothing in /etc/hosts.':
      'Impide que arranquen admanager y adoverlay-service y hace que tres servidores de anuncios de LG no apunten a ningún sitio en /etc/hosts.',
    'Keeps acr2 from starting: the service that recognises what is on screen (LG calls it LivePlus) and reports it.':
      'Impide que arranque acr2: el servicio que reconoce lo que hay en pantalla (LG lo llama LivePlus) y lo comunica.',
    'Stops remotelogger and service-logger, which collect logs and send them to LG.':
      'Detiene remotelogger y service-logger, que recogen registros y los envían a LG.',
    'Stops contentminer and nudge (recommendations and pop-up tips) and keeps sportsalarm from starting.':
      'Detiene contentminer y nudge (recomendaciones y consejos emergentes) e impide que arranque sportsalarm.',
    'Switches every group on.': 'Activa todos los grupos.',
    'Switches the debloat off: the services start again and the hosts lines are removed.':
      'Desactiva el debloat: los servicios vuelven a arrancar y se quitan las líneas de hosts.',
    'Voice and network notifications.': 'Voz y notificaciones de red.',
    'Your own photos behind Home: uploaded from a phone, or synced from Immich albums. Switch them on in the launcher: Customise > Wallpapers.':
      'Tus propias fotos detrás de Inicio: subidas desde el móvil o sincronizadas de álbumes de Immich. Actívalas en el launcher: Personalizar > Wallpapers.',
    'Shows a QR code. On the phone page you upload photos (they are made the right size on the phone), delete uploads, connect Immich, choose albums and hide single photos.':
      'Muestra un código QR. En la página del móvil subes fotos (se ajustan al tamaño adecuado en el móvil), borras subidas, conectas Immich, eliges álbumes y ocultas fotos sueltas.',
    'Photos uploaded from a phone, kept on the TV. At most 100.':
      'Fotos subidas desde el móvil, guardadas en el televisor. Como máximo 100.',
    'Photos from the Immich albums you chose, downloaded to the TV every six hours (and with Sync now), so Home never waits for Immich. At most 300.':
      'Fotos de los álbumes de Immich que elegiste, descargadas al televisor cada seis horas (y con Sincronizar ahora), para que Inicio nunca espere a Immich. Como máximo 300.',
    'Every photo Wallpapers can show, and the space they use on the TV (at most 150 MB).':
      'Todas las fotos que Wallpapers puede mostrar, y el espacio que ocupan en el televisor (como máximo 150 MB).',
    'Downloads new and changed photos from the chosen albums now and removes the ones that left them.':
      'Descarga ahora las fotos nuevas y cambiadas de los álbumes elegidos y quita las que salieron de ellos.',
    'Deletes every uploaded photo from the TV. Immich photos stay.':
      'Borra todas las fotos subidas del televisor. Las de Immich se quedan.',
    'Forgets the address and the key and deletes the Immich photos from the TV. Uploads stay.':
      'Olvida la dirección y la clave y borra las fotos de Immich del televisor. Las subidas se quedan.',
    'Puts the dock, the top buttons, hidden apps, the app order and the clock back to the defaults. The theme stays.':
      'Devuelve el dock, los botones superiores, las apps ocultas, el orden y el reloj a los valores predeterminados. El tema se queda.',
    'The launcher’s own settings go back to the defaults. Apps, the theme and everything in this app stay.':
      'Los ajustes propios del launcher vuelven a los predeterminados. Las apps, el tema y todo lo de esta app se quedan.',
    'On: the Home button opens this launcher. Off: LG’s own Home. Switching restarts the TV (about a minute); the service keeps running either way.':
      'Activado: el botón Inicio abre este launcher. Desactivado: el Inicio de LG. Cambiar reinicia el televisor (alrededor de un minuto); el servicio sigue funcionando en ambos casos.',
    'Lets other devices on your network send picture notifications to this TV with a POST request and a secret token. Off by default.':
      'Permite que otros dispositivos de tu red envíen notificaciones con imagen a este televisor con una petición POST y un token secreto. Desactivado por defecto.',
    'On: the TV listens on port 8767 for POST /notify with the token. Anyone who has the token and network access can show cards on this screen.':
      'Activado: el televisor escucha en el puerto 8767 peticiones POST /notify con el token. Cualquiera con el token y acceso a la red puede mostrar tarjetas en esta pantalla.',
    'Shows the address, the token and an example request.': 'Muestra la dirección, el token y una petición de ejemplo.',
    'Shows a QR code. A phone that scans it opens a page, served by the TV for ten minutes, that shows the notification address and the token with Copy buttons (for Home Assistant, for example). The token is a secret.':
      'Muestra un código QR. Un móvil que lo escanee abre una página que el televisor sirve diez minutos, con la dirección de notificación y el token con botones Copiar (por ejemplo para Home Assistant). El token es secreto.',
    'Creates a new secret token. Devices using the old one stop working.':
      'Crea un nuevo token secreto. Los dispositivos con el anterior dejan de funcionar.',
    'Optional. Speak into the remote and the TV turns it into text on the TV itself (Moonshine, English). The text can be sent to a server you run. Audio never leaves the TV. Needs a download of about 80 MB.':
      'Opcional. Habla al mando y el televisor lo convierte en texto en el propio aparato (Moonshine, inglés). El texto puede enviarse a un servidor tuyo. El audio nunca sale del televisor. Necesita una descarga de unos 80 MB.',
    'Downloads the speech engine, a 64-bit C library and the model (checksums are verified), then tests them. About a minute. Nothing is installed in the system folders.':
      'Descarga el motor de voz, una biblioteca C de 64 bits y el modelo (se comprueban las sumas) y los prueba. Alrededor de un minuto. No se instala nada en las carpetas del sistema.',
    'On: pressing the button you learned starts listening. A card shows what was heard.':
      'Activado: pulsar el botón aprendido empieza a escuchar. Una tarjeta muestra lo que se oyó.',
    'On: what you say is also sent as text to a language model through OpenRouter and the answer is shown on screen. Needs your OpenRouter key; the text goes to OpenRouter and the model provider, never audio.':
      'Activado: lo que dices también se envía como texto a un modelo de lenguaje a través de OpenRouter y la respuesta aparece en pantalla. Necesita tu clave de OpenRouter; el texto va a OpenRouter y al proveedor del modelo, nunca el audio.',
    'Shows a QR code. Scan it with a phone on the same Wi-Fi to enter your OpenRouter key, choose a model, write instructions and set a server address. Nothing is typed on the TV.':
      'Muestra un código QR. Escanéalo con un móvil en la misma wifi para introducir tu clave de OpenRouter, elegir un modelo, escribir instrucciones y fijar una dirección de servidor. No se escribe nada en el televisor.',
    'Choose the model that answers. The list is read from OpenRouter: the newest models of the main providers, with the price per million words in. The phone page lists every model.':
      'Elige el modelo que responde. La lista viene de OpenRouter: los modelos más nuevos de los grandes proveedores, con el precio por millón de palabras de entrada. La página del móvil muestra todos los modelos.',
    'Shows the commands to set the key, model and instructions from a shell, and how to ask by text.':
      'Muestra los comandos para fijar la clave, el modelo y las instrucciones desde un shell, y cómo preguntar por texto.',
    'The AI and Home Assistant remember the last turns for ten minutes. This clears them.':
      'La IA y Home Assistant recuerdan los últimos turnos durante diez minutos. Esto los borra.',
    'Sends what you say as text to Home Assistant’s Assist and shows its answer. Needs the address and a long-lived access token (Home Assistant profile page), entered on your phone. Choosing this row tests the connection.':
      'Envía lo que dices como texto a Assist de Home Assistant y muestra su respuesta. Necesita la dirección y un token de acceso de larga duración (página de perfil de Home Assistant), introducidos en el móvil. Elegir esta fila prueba la conexión.',
    'Home Assistant first, then the AI: Assist gets the text; if it does not understand, the AI answers. Home Assistant only: never the AI. The AI only: Home Assistant is not asked. Choose to switch.':
      'Primero Home Assistant, luego la IA: Assist recibe el texto; si no lo entiende, responde la IA. Solo Home Assistant: nunca la IA. Solo la IA: no se pregunta a Home Assistant. Elige para cambiar.',
    'Which Home Assistant conversation agent answers. The default is the built-in one; others (for example a language-model agent) are listed from your Home Assistant.':
      'Qué agente de conversación de Home Assistant responde. El predeterminado es el integrado; los demás (por ejemplo un agente con modelo de lenguaje) vienen de tu Home Assistant.',
    'LG’s own assistant reacts to the same button and sends the audio to LG. On: it is paused while voice is on. A reboot or switching this off undoes it.':
      'El asistente de LG reacciona al mismo botón y envía el audio a LG. Activado: queda en pausa mientras la voz está activa. Un reinicio o desactivarlo lo deshace.',
    'Records the code of the remote button that starts listening. Try the microphone button first; any spare button works.':
      'Guarda el código del botón que empieza a escuchar. Prueba primero el botón del micrófono; vale cualquier botón libre.',
    'Starts listening without the button: speak when the card appears.':
      'Empieza a escuchar sin el botón: habla cuando aparezca la tarjeta.',
    'Where the recognised text goes. Shows how to set the address of your server. Without one, the text is only shown on screen.':
      'Adónde va el texto reconocido. Muestra cómo fijar la dirección de tu servidor. Sin servidor, el texto solo se muestra en pantalla.',
    'Deletes the downloaded engine and model. The rest of CleanYourTV is not affected.':
      'Borra el motor y el modelo descargados. El resto de CleanYourTV no cambia.',
    'The remote’s Input button opens our Inputs list over the running app instead of LG’s picker. Open this screen to switch it off or to learn the button.':
      'El botón Input del mando abre nuestra lista de entradas sobre la app en uso en lugar del selector de LG. Abre esta pantalla para desactivarlo o aprender el botón.',
    'Shows a QR code. Scan it with a phone on the same Wi-Fi to copy a report for a bug report. Addresses and URL paths are masked; the page closes after ten minutes.':
      'Muestra un código QR. Escanéalo con un móvil en la misma wifi para copiar un informe para un fallo. Direcciones y rutas de URL están ocultas; la página se cierra tras diez minutos.',
    'Removes the apps, the boot scripts and your settings, then restarts the TV so LG’s Home comes back.':
      'Quita las apps, los scripts de arranque y tus ajustes y reinicia el televisor para que vuelva el Inicio de LG.',
    'On: pressing Input shows our Inputs list. Off: LG’s picker comes back at once.':
      'Activado: Input muestra nuestra lista de entradas. Desactivado: vuelve enseguida el selector de LG.',
    'Reads the code of your remote’s Input button from the hook, then tests that our list opens. The default is 241. Clear goes back to it.':
      'Lee el código del botón Input de tu mando desde el hook y luego comprueba que se abre nuestra lista. El predeterminado es 241. Borrar vuelve a él.',
    'Settings for Live TV: switch it on or off, set up or remove your playlist, refresh the guide and learn the Guide key.':
      'Ajustes de TV en directo: activarla o no, configurar o quitar tu lista, actualizar la guía y aprender el botón Guía.',
    'On: the launcher has a Live TV button and tile, the Inputs list has Live TV, and the Guide key can open the channel guide. Off: all of that is hidden and LG’s own player and guide are used. Your playlist is kept.':
      'Activado: el launcher tiene un botón y un mosaico de TV en directo, la lista de entradas tiene TV en directo y el botón Guía puede abrir la guía. Desactivado: todo eso se oculta y se usan el reproductor y la guía de LG. Tu lista se conserva.',
    'Your M3U playlist and its XMLTV guide. Choose it to set up: a QR code opens a page on your phone where you enter the playlist address and the 6-digit code shown here.':
      'Tu lista M3U y su guía XMLTV. Elígela para configurarla: un código QR abre una página en tu móvil donde introduces la dirección de la lista y el código de 6 cifras que se muestra aquí.',
    'Downloads the playlist and the programme guide again now. It also happens twice a day.':
      'Vuelve a descargar ahora la lista y la guía de programas. También ocurre dos veces al día.',
    'Empties the Recent tab and the list of channels that failed. Favourites stay.':
      'Vacía la pestaña Recientes y la lista de canales que fallaron. Los favoritos se quedan.',
    'Deletes the playlist address, the channel list, the guide and your favourites from the TV.':
      'Borra del televisor la dirección de la lista, la lista de canales, la guía y tus favoritos.',
    'Deletes the playlist and everything stored for it on the TV. You can set it up again.':
      'Borra la lista y todo lo guardado para ella en el televisor. Puedes volver a configurarla.',
    'Records the Guide button’s code. Afterwards it opens the Live TV channel guide over whatever is running (only while Live TV is on). Clear it to get LG’s guide back.':
      'Guarda el código del botón Guide. Después abre la guía de TV en directo sobre lo que esté en marcha (solo con la TV en directo activada). Bórralo para recuperar la guía de LG.',
    'How the Input button shows the Inputs. Over the running app, ready in the background: instant, tested on webOS 25. Over the running app, started when pressed: nothing runs hidden, so it cannot keep the remote; the default on older webOS, where the background one showed a loading circle. The launcher’s Inputs list: the TV goes to our Home (needs CleanYourTV as Home; otherwise the key stays with LG). Choose to go to the next one.':
      'Cómo muestra el botón Input las entradas. Sobre la app en uso, lista en segundo plano: al instante, probado en webOS 25. Sobre la app en uso, se inicia al pulsar: nada corre oculto, así que no puede retener el mando; el predeterminado en webOS antiguos, donde la versión en segundo plano mostraba un círculo de carga. La lista de entradas del launcher: el televisor va a nuestro Inicio (necesita CleanYourTV como Inicio; si no, el botón sigue con LG). Elige para pasar a la siguiente.',
    'Optional. Records the Home button’s code. The Home key keeps working exactly as before.':
      'Opcional. Guarda el código del botón Home. El botón Home sigue funcionando igual que antes.',
    'Back to the previous list.': 'Volver a la lista anterior.',
    'Nothing changes.': 'No cambia nada.',
    'Deletes the apps, the boot scripts and the settings, then restarts the TV.':
      'Quita las apps, los scripts de arranque y los ajustes y reinicia el televisor.',
    'Restarts the TV; this launcher is Home after it starts.': 'Reinicia el televisor; después este launcher es el Inicio.',
    'Restarts the TV; LG’s own Home is Home after it starts. You can switch back here.':
      'Reinicia el televisor; después el Inicio de LG es el Inicio. Puedes volver a cambiar aquí.',
    'A newer package is available. Install it before the setup: it may contain fixes for your firmware.':
      'Hay un paquete más nuevo. Instálalo antes de la configuración: puede traer arreglos para tu firmware.',
    'The remote’s Input button opens our Inputs list instead of LG’s picker. You can change this later.':
      'El botón Input del mando abre nuestra lista de entradas en lugar del selector de LG. Puedes cambiarlo después.',
    'Installs the launcher, replaces LG’s Home at boot and starts the service. About a minute; the screen blinks once. If the new Home does not come up, the setup removes itself and restarts the TV.':
      'Instala el launcher, sustituye el Inicio de LG al arrancar e inicia el servicio. Alrededor de un minuto; la pantalla parpadea una vez. Si el nuevo Inicio no aparece, la configuración se quita y reinicia el televisor.',
    'Your firmware is not in the compatibility list and LG’s Home looks different. This tries it anyway; a failed start restarts the TV with LG’s Home.':
      'Tu firmware no está en la lista de compatibilidad y el Inicio de LG es distinto. Esto lo intenta igualmente; un inicio fallido reinicia el televisor con el Inicio de LG.',
    'Works without the service: looks for a newer package and installs it through the root service.':
      'Funciona sin el servicio: busca un paquete más nuevo y lo instala mediante el servicio root.',
    'This TV also has LG’s full-screen Home: if the Home button opens that instead of this launcher, set TV Settings > General > Home Settings > Home Style to Basic.':
      'Este televisor también tiene el Inicio a pantalla completa de LG: si el botón Home lo abre en lugar de este launcher, pon Ajustes > General > Ajustes de Inicio > Estilo de Inicio en Básico.',
    '4K (the default) keeps photos at 3840 pixels, the size the TV draws Home at, so they look sharp; Full HD at 1920 fits about four times as many photos in 150 MB. It applies to new uploads and to the next Immich sync.':
      '4K (predeterminado) guarda las fotos a 3840 píxeles, el tamaño al que el televisor dibuja Inicio, para que se vean nítidas; Full HD a 1920 permite unas cuatro veces más fotos en 150 MB. Se aplica a las nuevas subidas y a la próxima sincronización de Immich.',
  },
};
var MT = MTX[MLANG] || null,
  MTPL = null;
function trTemplates() {
  if (MTPL) return MTPL;
  MTPL = [];
  var esc = function (x) {
    return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };
  for (var k in MT)
    if (/%[sd]/.test(k))
      MTPL.push([
        new RegExp('^' + esc(k).replace(/%s/g, '([\\s\\S]+?)').replace(/%d/g, '([0-9][0-9.,]*)') + '$'),
        k,
        /\n| \u00B7 /.test(k),
      ]);
  MTPL.sort(function (a, b) {
    return b[1].length - a[1].length;
  });
  return MTPL;
}
function trTpl(s, joined) {
  var tp = trTemplates();
  for (var i = 0; i < tp.length; i++) {
    if (tp[i][2] !== joined) continue;
    var m = tp[i][0].exec(s);
    if (m) {
      var j = 1;
      return MT[tp[i][1]].replace(/%[sd]/g, function () {
        return tr(m[j++]);
      });
    }
  }
  return null;
}
function tr(s) {
  if (!MT || s === null || s === undefined || s === '') return s;
  s = String(s);
  if (Object.prototype.hasOwnProperty.call(MT, s)) return MT[s];
  var r = trTpl(s, true);
  if (r !== null) return r;
  if (s.indexOf('\n') >= 0) return s.split('\n').map(tr).join('\n');
  if (s.indexOf(' \u00B7 ') >= 0) return s.split(' \u00B7 ').map(tr).join(' \u00B7 ');
  r = trTpl(s, false);
  return r !== null ? r : s;
}
