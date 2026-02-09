const i18n = {
  friend: {
    en: {
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
      my_place_note: "Wait… you know where I live?! 😳<br/>If you don't, here's my address:<br/>8419 avenue Henri-Julien<br/>Montréal, H2P 2J5",

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

      /* ===== Buttons ===== */
      button_submit: "Book it!",
      button_reset: "Oops!",

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
        <h6>As if it never existed in the first place! 😶</h6>
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

      legend_meal: "That's when I'm eating.",
      legend_meal_help: "Yes, we could eat together then, but I'll have to go get busy afterwards.",

      legend_waiting: "That one's waiting for me to confirm.",
      legend_waiting_help: "So just be patient! Yes, it may take me up to 12 hours to get back to you, but I will!",

      legend_confirm: "That one's been confirmed.",
      legend_confirm_help: "So if every goes according to plan, we shall see each other then! Lucky you!",

      legend_trash: "That one's been cancelled.",
      legend_trash_help: "Don't take it personally; it's the stars! It's always the stars! They just weren't aligned.<br/>Now, just hit the trash button, it's already too late for it anyway; might as well end its suffering."
    }
  },
  client: {
    en: {
      /* ===== Headings & summaries ===== */
      summary_date_time:
        "{weekday}, {month} {day}<sup>{suffix}</sup> {year}<br/>from {startHour12}:{startMinutes} {startPeriod} to {endHour12}:{endMinutes} {endPeriod}",
      heading_hangout: "Meeting request",
      presentation_date_time: "Selected date and time:",
      presentation_confirmation_question: "Please confirm this information.",

      /* ===== Date & time section ===== */
      label_date: "Date:",
      label_time_from: "From:",
      label_time_to: "To:",
      time_warning:
        "Please take into account preparation, meals, and travel time.",

      /* ===== Identity section ===== */
      heading_identity: "Participant information",
      label_names: "Name(s):",
      help_names: "",

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
        "Meeting address:<br/>8419 avenue Henri-Julien<br/>Montréal, H2P 2J5",

      option_your_place: "Your address",
      your_place_note:
        "Please provide the address where the meeting will take place.",

      label_your_address: "Address:",
      help_your_address: "",

      option_other_place: "Other location",
      other_place_note: "Please specify the location if applicable.",
      label_other_place: "Preferred location:",
      help_other_place: "",

      /* ===== Purpose section ===== */
      heading_why: "Purpose",
      label_why: "Planned activity or objective:",
      help_why:
        "Include any relevant information or requirements.",

      /* ===== Buttons ===== */
      button_submit: "Submit",
      button_reset: "Reset",
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
        <h6>No further action is required.</h6>
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

      legend_busy: "Unavailable time slot.",
      legend_meal: "Meal break.",
      legend_meal_help:
        "This time slot can be scheduled; however, availability will be limited immediately afterward.",

      legend_waiting: "Pending confirmation.",
      legend_waiting_help:
        "This request is awaiting review and confirmation.",

      legend_confirm: "Confirmed booking.",
      legend_confirm_help:
        "This booking has been confirmed and is scheduled as planned.",

      legend_trash: "Cancelled booking.",
      legend_trash_help:
        "This booking has been cancelled. Please remove it using the delete action."

    }
  }
};

export default i18n;