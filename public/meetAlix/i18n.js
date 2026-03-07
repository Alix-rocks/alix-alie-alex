const i18n = {
  friend: {
    en: {
      /* ===== Calendar ===== */
      meal: "Meal",
      calendar_sunday: "S",
      calendar_monday: "M",
      calendar_tuesday: "T",
      calendar_wednesday: "W",
      calendar_thursday: "T",
      calendar_friday: "F",
      calendar_saturday: "S",
      calendar_unknown: "Not sure yet!<br/>Come back around<br/>the",

      /* ===== Headings & summaries ===== */
      summary_date_time: 
        "{weekday}, {month} {day}<sup>{suffix}</sup> {year}<br/>from {startHour12}:{startMinutes} {startPeriod} to {endHour12}:{endMinutes} {endPeriod}",
      heading_hangout: "So… wanna hang out? 🙃",
      presentation_date_time: "So you chose this date & time:",
      presentation_confirmation_question: "Is that your final answer?",

      /* ===== Date & time section ===== */
      label_date: "Date:",
      label_time_from: "From:",
      label_time_to: "To:",
      time_warning:
        "Please consider meal, prep, and travel times.<br/>" +
        "As in: don’t expect me to be anywhere other than my place before noon!",

      /* ===== Identity section ===== */
      heading_identity: "Which one(s) are you?",
      label_names: "Your name(s):",
      help_names:
        "You and anyone else you wanna invite — be they people, " +
        "imaginary friends, or other personalities of yours.",

      /* ===== Communication section ===== */
      heading_communication: "How shall we communicate?",
      communication_warning:
        "One is enough — but it really should be one of them.<br/>" +
        "I don’t do pigeons anymore, and squirrels just aren’t reliable.",

      label_email: "Email:",
      label_cell: "Cell (SMS):",
      label_messenger_nickname: "Nickname on Messenger:",
      label_whatsapp_number: "Number on WhatsApp:",

      /* ===== Location section ===== */
      heading_location: "Where shall we meet?",

      /* --- Online --- */
      subheading_online: "Online",
      online_description:
        "As in video call. I don’t do phone calls anymore — they kinda freak me out.<br/>" +
        "Let me see your face so I can adjust mine!",

      option_messenger: "Messenger",
      messenger_note: "Then I’ll definitely need your Messenger nickname. ☝️",

      option_google_meet: "Google Meet",

      option_whatsapp: "WhatsApp",
      whatsapp_note: "Then I’ll definitely need your WhatsApp number. ☝️",

      /* --- Offline --- */
      subheading_offline: "Offline",
      offline_description: "As in the real world?! 😱",

      option_my_place: "My place",
      my_place_note: "Wait… you know where I live?! 😳<br/>If you don't, here's my address:<br/>8419 Henri-Julien avenue<br/>Montreal, H2P&nbsp;2J5",

      option_your_place: "Your place",
      your_place_note:
        "Sure, but do I remember where you live?<br/>" +
        "You might have to remind me of your address. 👇",

      label_your_address: "Here, give me your address",
      help_your_address: "I promise not to get all stalkerish on you. 👀",

      option_other_place: "Someplace else",
      other_place_note: "",
      label_other_place: "Any preferences as to where?",
      help_other_place:
        "As long as it’s not too far from a Metro station, " +
        "I’ll consider it a real place.",

      /* ===== Purpose section ===== */
      heading_why: "Why?!",
      label_why: "What would you like us to do?",
      help_why: "Anything I should know, prepare for, or worry about?",

      /* ===== Summary ===== */
      summary_presentation: "Here's a glimpse<br/>into our future:",
      summary_andMe: ", and yours truly",
      summary_shall: "shall be hanging out on",
      summary_where_on: "on",
      summary_where_messenger: "Messenger",
      summary_where_googleMeet: "Google Meet",
      summary_where_whatsApp: "WhatsApp",
      summary_where_mine: "8419 Henri-Julien ave, Montreal, Qc, H2P&nbsp;2J5",
      summary_where_at: "somewhere around",
      summary_why: "BTW:",
      summary_note_pending: "Although, we're still waiting on the confirmation.",
      summary_note_confirmed: "Yep, that has been confirmed. Yay!",
      summary_note_cancelled: "Nevermind, that has been cancelled.",

      /* ===== Buttons ===== */
      button_submit: "Book it!",
      button_reset: "Oops!",
      button_modify: "Modify",
      button_save: "Save",

      message_waiting: `<div id="waitingMessage" class="message">
        <button class="iconBtn topRightCorner" onclick="removeMessage()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h2>Wait For It…</h2>
        <span class="typcn typcn-wine" style="font-size: 50px; line-height: 1em;"></span>
        <h6 style="margin-top: 0.5em; margin-bottom: 2em;">
          Like an hourglass<br />
          but quicker
        </h6>
      </div>`,

      message_confirm: `<div id="confirmMessage" class="message">
        <button class="iconBtn topRightCorner" onclick="removeMessage()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h2>You did it!</h2>
        <h3 style="margin-bottom: 0;">
          Alright,<br/>
          so now that you did your part;<br/>
          all you've got to do is<br/>
          sit tight and wait for me to do mine…
          </h3>
        <h6 style="margin-top: 0;">Team work makes the dream works!</h6>
        <h2 style="color: var(--pending-border)">See you soon!<br/>🤗</h2>
      </div>`,

      message_trash_confirm: `<div id="confirmTrashMessage" class="message">
        <button class="iconBtn topRightCorner" onclick="removeMessage()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h2>Well… I guess this is goodbye then.</h2>
        <h3>The whole thing have been erased.</h3>
        <h6>As if it never existed in the first place! 😶<br/>
        (You can always just book another one. 😉)</h6>
      </div>`,

      message_error: `<div id="errorMessage" class="message">
        <button class="iconBtn topRightCorner" onclick="removeMessage()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h2>Oooops…</h2>
        <h3>
          Something went wrong.<br/>
          Please try again 🙃
        </h3>
        <h6>And if that still doesn't work, please let me know!</h6>
      </div>`,

      legend_busy: "That's when I'm busy.",
      legend_busy_help: "So no, I'm not available.",

      legend_meal: "That's when I'm eating.",
      legend_meal_help: "Yes, we could eat together then, but I'll have to go get busy afterwards.",

      legend_waiting: "That one's waiting for me to confirm.",
      legend_waiting_help: "So just be patient! Although, if you don’t hear back in 24 hours, assume I got distracted and text me.",

      legend_confirm: "That one's been confirmed.",
      legend_confirm_help: "So if everything goes according to plan, we shall see each other then! Lucky you!",

      legend_trash: "That one's been cancelled.",
      legend_trash_help: "Don't take it personally; it's the stars! It's always the stars! They just weren't aligned.<br/>Now, just hit the trash button, it's already too late for it anyway; might as well end its suffering."
    },
    fr: {
      /* ===== Calendar ===== */
      meal: "Bouffe",
      calendar_sunday: "D",
      calendar_monday: "L",
      calendar_tuesday: "M",
      calendar_wednesday: "M",
      calendar_thursday: "J",
      calendar_friday: "V",
      calendar_saturday: "S",
      calendar_unknown: "Je sais pas encore&nbsp;!<br/>Reviens autour<br/>du",
      
      /* ===== Headings & summaries ===== */
      summary_date_time: 
        "{weekday}, le {day} {month} {year}<br/>de {startHour24}h{startMinutes} à {endHour24}h{endMinutes}",
      heading_hangout: "Fac… on va finir par se voir&nbsp;? 🙃",
      presentation_date_time: "T'as choisi ce moment&nbsp;:",
      presentation_confirmation_question: "C’est votre dernier mot&nbsp;?",

      /* ===== Date & time section ===== */
      label_date: "Date&nbsp;:",
      label_time_from: "De&nbsp;:",
      label_time_to: "À&nbsp;:",
      time_warning:
        "STP, prends en compte le temps de préparation, repas et déplacements.<br/>" +
        "Genre, attends-toi pas à c'que puisse être ailleurs que chez nous avant midi&nbsp;!",

      /* ===== Identity section ===== */
      heading_identity: "Qui êtes-vous?",
      label_names: "Nom(s)&nbsp;:",
      help_names:
        "Toi pis toute autre personne que tu veux inviter;<br/> " +
        "réelle ou imaginaire.",

      /* ===== Communication section ===== */
      heading_communication: "Comment est-ce qu'on devrait communiquer&nbsp;?",
      communication_warning:
        "Tu peux en mettre yink un, mais ça en prend au moins un.<br/>" +
        "J'utilise pu d'pigeon voyageur, pis les écureuils sont juste pas fiables.",

      label_email: "Email&nbsp;:",
      label_cell: "Cell (texto)&nbsp;:",
      label_messenger_nickname: "Surnom sur Messenger&nbsp;:",
      label_whatsapp_number: "Numéro sur WhatsApp&nbsp;:",

      /* ===== Location section ===== */
      heading_location: "Où est-ce qu'on devrait se rencontrer&nbsp;?",

      /* --- Online --- */
      subheading_online: "En ligne",
      online_description:
        "Genre vidéoconférence. J'essaies d'arrêter les appels téléphoniques; ça m'met mal-à-l'aise paske j'sais jamais quelle face faire…",

      option_messenger: "Messenger",
      messenger_note: "Fac là, c'est sûr que ça va m'prendre ton surnom sur Messenger.&nbsp;☝️",

      option_google_meet: "Google Meet",

      option_whatsapp: "WhatsApp",
      whatsapp_note: "Fac là, c'est sûr que ça va m'prendre ton numéro sur WhatsApp.&nbsp;☝️",

      /* --- Offline --- */
      subheading_offline: "Hors ligne",
      offline_description: "Genre, en vrai, là&nbsp;?!&nbsp;😱",

      option_my_place: "Chez nous",
      my_place_note: "Euh… tu sais où j'habite&nbsp;?!&nbsp;😳<br/>Sinon, tiens, v'la mon adresse&nbsp;:<br/>8419 avenue Henri-Julien<br/>Montréal, H2P&nbsp;2J5",

      option_your_place: "Chez vous",
      your_place_note:
        "Ok, mais est-ce que j'me souviens où t'habites&nbsp;?<br/>" +
        "Tu risques de devoir me rappeller ton adresse.&nbsp;👇",

      label_your_address: "Stp, donnes-moi ton adresse.",
      help_your_address: "Promis, j'vas pas aller t'espionner chez vous.&nbsp;👀",

      option_other_place: "Ailleurs",
      other_place_note: "",
      label_other_place: "Où est-ce que tu préférerais qu'on se voit?",
      help_other_place:
        "Tant que c'est pas trop loin d'une station de Métro, j'vais l'considérer. Si y faut que j'prenne l'autobus, j'charge extra&nbsp;!&nbsp;😜",

      /* ===== Purpose section ===== */
      heading_why: "Pourquoi&nbsp;?!",
      label_why: "Qu'est-ce que tu voudrais qu'on fasse; quelles sont tes intentions, espoirs, fantasmes&nbsp;?",
      help_why: "Quelque chose que je dois savoir à l'avance, me préparer pour ou stresser sur&nbsp;?",

      /* ===== Summary ===== */
      summary_presentation: "Voilà un aperçu<br/>de notre futur&nbsp;:",
      summary_andMe: ", et moi-même",
      summary_shall: "pourrons finalement se voir",
      summary_where_on: "sur",
      summary_where_messenger: "Messenger",
      summary_where_googleMeet: "Google Meet",
      summary_where_whatsApp: "WhatsApp",
      summary_where_mine: "8419 avenue Henri-Julien, Montréal, Qc, H2P&nbsp;2J5",
      summary_where_at: "au",
      summary_why: "En passant&nbsp;:",
      summary_note_pending: "Quoiqu'il faut encore attendre la confirmation.",
      summary_note_confirmed: "Oui, oui, ça a été confirmé. Yé&nbsp;!",
      summary_note_cancelled: "Oublies ça; ça a été annulé…",

      /* ===== Buttons ===== */
      button_submit: "Réserve!",
      button_reset: "Oups!",
      button_modify: "Modifier",
      button_save: "Sauver",

      message_waiting: `<div id="waitingMessage" class="message">
        <button class="iconBtn topRightCorner" onclick="removeMessage()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h2>Attends…</h2>
        <span class="typcn typcn-wine" style="font-size: 50px; line-height: 1em;"></span>
        <h6 style="margin-top: 0.5em; margin-bottom: 2em;">
          C'est comme un sablier<br />
          mais plus rapide
        </h6>
      </div>`,

      message_confirm: `<div id="confirmMessage" class="message">
        <button class="iconBtn topRightCorner" onclick="removeMessage()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h2>Bravo&nbsp;!</h2>
        <h3 style="margin-bottom: 0;">
          Bon,<br/>
          asteur que t'as faite ta part;<br/>
          tout c'qui t'reste à faire<br/>
          c'est d'attendre que moi j'fasse la mienne…
          </h3>
        <h6 style="margin-top: 0;">Ostie qu'on fait une belle équipe&nbsp;!</h6>
        <h2 style="color: var(--pending-border)">À bientôt&nbsp;!<br/>🤗</h2>
      </div>`,

      message_trash_confirm: `<div id="confirmTrashMessage" class="message">
        <button class="iconBtn topRightCorner" onclick="removeMessage()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h2>Bon ben… j'imagine que c'est la fin.</h2>
        <h3>Ça a toutte été effacé.</h3>
        <h6>Comme si ça avait jamais existé…&nbsp;😶<br/>
        (Tu peux toujours prendre un autre rendez-vous si tu veux.&nbsp;🙃)</h6>
      </div>`,

      message_error: `<div id="errorMessage" class="message">
        <button class="iconBtn topRightCorner" onclick="removeMessage()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h2>Ouuuups…</h2>
        <h3>
          Quelque chose a planté.<br/>
          S.V.P. réessayez plus tard.&nbsp;🙃
        </h3>
        <h6>Pis si ça marche toujours pas, stp, dis-moi-le&nbsp;!</h6>
      </div>`,

      legend_busy: "Ça, c'est c'que j'ai de déjà prévu.",
      legend_busy_help: "Fac non, j'suis pas disponible.",

      legend_meal: "Ça, c'est quand j'mange.",
      legend_meal_help: "Oui, on pourrait se voir là, pour manger, mais après il va falloir que j'parte faire c'que j'ai à faire.",

      legend_waiting: "Ça, c'est parce que t'attends que j'confirme notre rdv.",
      legend_waiting_help: "Fac respire pis attends. Si dans 24 heures j't'ai toujours pas donné signe de vie, assume que c'est mon TDAH pis écris-moi.",

      legend_confirm: "Ça, c'est bel et bien confirmé.",
      legend_confirm_help: "Fac si tout va bien, on va finalement pouvoir se voir&nbsp;!",

      legend_trash: "Ça, ça a été annulé.",
      legend_trash_help: "Prends-le pas personnel; des fois les étoiles sont juste pas alignées comme faut&nbsp;!<br/>Fac là, clique sur la poubelle pour mettre fin à nos souffrances. On se reprendra&nbsp;!"
    }
  },
  client: {
    en: {
      /* ===== Calendar ===== */
      meal: "",
      calendar_sunday: "S",
      calendar_monday: "M",
      calendar_tuesday: "T",
      calendar_wednesday: "W",
      calendar_thursday: "T",
      calendar_friday: "F",
      calendar_saturday: "S",
      calendar_unknown: "Availabilities unknown.<br/>Please come back around<br/>the",
      
      /* ===== Headings & summaries ===== */
      summary_date_time:
        "{weekday}, {month} {day}<sup>{suffix}</sup> {year}<br/>from {startHour12}:{startMinutes} {startPeriod} to {endHour12}:{endMinutes} {endPeriod}",
      heading_hangout: "Meeting request",
      presentation_date_time: "Selected date and time:",
      // presentation_confirmation_question: "Please confirm this information.",
      presentation_confirmation_question: "",

      /* ===== Date & time section ===== */
      label_date: "Date:",
      label_time_from: "From:",
      label_time_to: "To:",
      // time_warning:
      //   "Please take into account preparation, meals, and travel time.",
      time_warning: "",

      /* ===== Identity section ===== */
      heading_identity: "Participant(s) information",
      label_names: "Name(s):",
      help_names: "You and anyone else you would like to invite.",

      /* ===== Communication section ===== */
      heading_communication: "Preferred method of communication",
      communication_warning:
        "Please provide at least one valid contact method.",

      label_email: "Email address:",
      label_cell: "Mobile number (SMS):",
      label_messenger_nickname: "Messenger username:",
      label_whatsapp_number: "WhatsApp number:",

      /* ===== Location section ===== */
      heading_location: "Meeting location",

      /* --- Online --- */
      subheading_online: "Online",
      online_description:
        "The meeting will take place via a video conferencing platform.",

      option_messenger: "Messenger",
      messenger_note: "A Messenger username is required. See above.",

      option_google_meet: "Google Meet",

      option_whatsapp: "WhatsApp",
      whatsapp_note: "A WhatsApp number is required. See above.",

      /* --- Offline --- */
      subheading_offline: "In person",
      offline_description: "The meeting will take place at a physical location.",

      option_my_place: "My address",
      my_place_note:
        "Meeting address:<br/>8419 Henri-Julien avenue<br/>Montreal, H2P&nbsp;2J5",

      option_your_place: "Your address",
      your_place_note:
        "Please provide the address where the meeting will take place.",

      label_your_address: "Address:",
      help_your_address: "",

      option_other_place: "Other location",
      // other_place_note: "Please specify the location if applicable.",
      other_place_note: "",
      label_other_place: "Preferred location:",
      help_other_place: "",

      /* ===== Purpose section ===== */
      heading_why: "Purpose",
      label_why: "Planned activity or objective:",
      help_why:
        "Include any relevant information or requirements.",

      /* ===== Summary ===== */
      summary_presentation: "Meeting summary:",
      summary_andMe: ", and myself",
      summary_shall: "shall meet on",
      summary_where_on: "on",
      summary_where_messenger: "Messenger",
      summary_where_googleMeet: "Google Meet",
      summary_where_whatsApp: "WhatsApp",
      summary_where_mine: "8419 Henri-Julien ave, Montreal, Qc, H2P&nbsp;2J5",
      summary_where_at: "at",
      summary_why: "Notes:",
      summary_note_pending: "This meeting is still waiting for confirmation.",
      summary_note_confirmed: "This meeting has been confirmed.",
      summary_note_cancelled: "This meeting has been cancelled.",

      /* ===== Buttons ===== */
      button_submit: "Submit",
      button_reset: "Reset",
      button_modify: "Modify",
      button_save: "Save",


      message_waiting: `<div id="waitingMessage" class="message">
        <button class="iconBtn topRightCorner" onclick="removeMessage()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h2>Please wait</h2>
        <span class="typcn typcn-wine" style="font-size: 50px; line-height: 1em;"></span>
        <h6 style="margin-top: 0.5em; margin-bottom: 2em;">Your request is currently being processed.</h6>
      </div>`,

      message_confirm: `<div id="confirmMessage" class="message">
        <button class="iconBtn topRightCorner" onclick="removeMessage()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h2>Request submitted</h2>
        <h3 style="margin-bottom: 0;">
          Your request has been successfully recorded.<br/>
          You will be notified once it has been reviewed.
        </h3>
        <h6 style="margin-top: 0;">Thank you for your patience.</h6>
        <h2 style="color: var(--pending-border)">See you soon</h2>
      </div>`,

      message_trash_confirm: `<div id="confirmTrashMessage" class="message">
        <button class="iconBtn topRightCorner" onclick="removeMessage()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h2>Request deleted</h2>
        <h3>The request has been permanently removed.</h3>
        <h6>You may request another meeting at your convenience.</h6>
      </div>`,

      message_error: `<div id="errorMessage" class="message">
        <button class="iconBtn topRightCorner" onclick="removeMessage()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h2>An error occurred</h2>
        <h3>
          The operation could not be completed.<br/>
          Please try again.
        </h3>
        <h6>If the problem persists, please contact support.</h6>
      </div>`,

      legend_busy: "Unavailable time slot",
      legend_busy_help: "",
      // legend_meal: "Meal break",
      // legend_meal_help:
      //   "This time slot can be scheduled; however, availability will be limited immediately afterward.",
      legend_meal: "",
      legend_meal_help: "",

      legend_waiting: "Pending confirmation",
      legend_waiting_help:
        "If I haven’t replied within 24 hours, please don’t hesitate to contact me.",

      legend_confirm: "Confirmed booking",
      legend_confirm_help:
        "This booking has been confirmed and is scheduled as planned.",

      legend_trash: "Cancelled booking",
      legend_trash_help:
        "This booking has been cancelled. Please remove it using the delete action.<br/>" +
        "Don't hesitate to book another meeting."

    },
    fr: {
      /* ===== Calendar ===== */
      meal: "",
      calendar_sunday: "D",
      calendar_monday: "L",
      calendar_tuesday: "M",
      calendar_wednesday: "M",
      calendar_thursday: "J",
      calendar_friday: "V",
      calendar_saturday: "S",
      calendar_unknown: "Disponibilités inconnues.<br/>Veuillez revenir autour<br/>du",
      
      /* ===== Headings & summaries ===== */
      summary_date_time:
        "{weekday}, le {day} {month} {year}<br/>de {startHour24}h{startMinutes} à {endHour24}h{endMinutes}",
      heading_hangout: "Demande de rendez-vous",
      presentation_date_time: "Date et heures sélectionnées&nbsp;:",
      // presentation_confirmation_question: "Please confirm this information.",
      presentation_confirmation_question: "",

      /* ===== Date & time section ===== */
      label_date: "Date&nbsp;:",
      label_time_from: "De&nbsp;:",
      label_time_to: "À&nbsp;:",
      // time_warning:
      //   "Please take into account preparation, meals, and travel time.",
      time_warning: "",

      /* ===== Identity section ===== */
      heading_identity: "Personnes impliquées",
      label_names: "Nom(s)&nbsp;:",
      help_names: "Vous et toute(s) autre(s) personne(s) que vous souhaitez inviter.",

      /* ===== Communication section ===== */
      heading_communication: "Méthode de communication préférée",
      communication_warning:
        "Fournir au moins une de ces informations.",

      label_email: "Adresse courriel&nbsp;:",
      label_cell: "Numéro de cellulaire (message texte)&nbsp;:",
      label_messenger_nickname: "Surnom sur Messenger&nbsp;:",
      label_whatsapp_number: "Numéro sur WhatsApp&nbsp;:",

      /* ===== Location section ===== */
      heading_location: "Lieu de rencontre",

      /* --- Online --- */
      subheading_online: "En ligne",
      online_description:
        "La rencontre aura lieu sur une plateforme de vidéoconférence.",

      option_messenger: "Messenger",
      messenger_note: "Votre surnom sur Messenger sera donc requis. Voir plus haut.",

      option_google_meet: "Google Meet",

      option_whatsapp: "WhatsApp",
      whatsapp_note: "Votre numéro sur WhatsApp sera donc requis. Voir plus haut.",

      /* --- Offline --- */
      subheading_offline: "Hors ligne",
      offline_description: "La rencontre aura lieu en personne, dans un lieu physique.",

      option_my_place: "Chez moi",
      my_place_note:
        "Mon adresse&nbsp;:<br/>8419 Avenue Henri-Julien<br/>Montréal, H2P&nbsp;2J5",

      option_your_place: "Chez vous",
      your_place_note:
        "Inscrire votre adresse ci-dessous.",

      label_your_address: "Adresse&nbsp;:",
      help_your_address: "",

      option_other_place: "Autre lieu",
      // other_place_note: "Please specify the location if applicable.",
      other_place_note: "Précisez le lieu où vous voudriez qu'on se rencontre.",
      label_other_place: "Emplacement préféré&nbsp;:",
      help_other_place: "",

      /* ===== Purpose section ===== */
      heading_why: "Raison de la rencontre",
      label_why: "Précisez vos attentes et intentions pour cette rencontre&nbsp;:",
      help_why:
        "Ainsi que toutes informations pertinentes.",

      /* ===== Summary ===== */
      summary_presentation: "Résumé de la rencontre&nbsp;:",
      summary_andMe: ", et moi-même",
      summary_shall: "nous rencontrerons",
      summary_where_on: "sur",
      summary_where_messenger: "Messenger",
      summary_where_googleMeet: "Google Meet",
      summary_where_whatsApp: "WhatsApp",
      summary_where_mine: "8419 Avenue Henri-Julien, Montréal, Qc, H2P&nbsp;2J5",
      summary_where_at: "au",
      summary_why: "Notes&nbsp;:",
      summary_note_pending: "Cette rencontre est en attente de confirmation.",
      summary_note_confirmed: "Cette rencontre a bel et bien été confirmée.",
      summary_note_cancelled: "Cette rencontre a été annulée.",

      /* ===== Buttons ===== */
      button_submit: "Soumettre",
      button_reset: "Annuler",
      button_modify: "Modifier",
      button_save: "Sauver",

      message_waiting: `<div id="waitingMessage" class="message">
        <button class="iconBtn topRightCorner" onclick="removeMessage()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h2>Veuillez patienter</h2>
        <span class="typcn typcn-wine" style="font-size: 50px; line-height: 1em;"></span>
        <h6 style="margin-top: 0.5em; margin-bottom: 2em;">Votre demande est présentement en traitement.</h6>
      </div>`,

      message_confirm: `<div id="confirmMessage" class="message">
        <button class="iconBtn topRightCorner" onclick="removeMessage()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h2>Requête soumise et en révision</h2>
        <h3 style="margin-bottom: 0;">
          Votre demande a bien été soumise et est présentement en attente de confirmation.<br/>
          Je vous contacterai lorsque j'aurai confirmé le tout.
        </h3>
        <h6 style="margin-top: 0;">Merci pour votre patience.</h6>
        <h2 style="color: var(--pending-border)">Bonne journée.</h2>
      </div>`,

      message_trash_confirm: `<div id="confirmTrashMessage" class="message">
        <button class="iconBtn topRightCorner" onclick="removeMessage()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h2>Requête retirée</h2>
        <h3>Votre requête a bel et bien été éliminée.</h3>
        <h6>Vous pourrez prendre un autre rendez-vous au moment opportun.</h6>
      </div>`,

      message_error: `<div id="errorMessage" class="message">
        <button class="iconBtn topRightCorner" onclick="removeMessage()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h2>Une erreur est survenue</h2>
        <h3>
          L'opération n'a pu être effectuée.<br/>
          Veuillez essayer encore.
        </h3>
        <h6>Si le problème persiste, veuillez me contacter.</h6>
      </div>`,

      legend_busy: "Période non disponible",
      legend_busy_help: "",

      legend_meal: "",
      legend_meal_help: "",

      legend_waiting: "En attente de confirmation",
      legend_waiting_help:
        "Si je ne vous ai pas répondu dans les 24 heures, n’hésitez pas à me contacter.",

      legend_confirm: "Rendez-vous confirmé",
      legend_confirm_help:
        "Ce rendez-vous à été confirmé et devrait avoir lieu tel que prévu.",

      legend_trash: "Rendez-vous annulé",
      legend_trash_help:
        "Ce rendez-vous a été annulé. Veuillez cliquer sur la poubelle pour l'éliminer.<br/>" +
        "N'hésitez pas à prendre un autre rendez-vous."
    }
  }
};

export default i18n;