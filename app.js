(() => {
  const transcript = document.querySelector('#transcript');
  const form = document.querySelector('#prompt-form');
  const input = document.querySelector('#command-input');
  const enterButton = document.querySelector('#enter-button');
  const hint = document.querySelector('#hint');
  const quick = document.querySelector('#quick-commands');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sequence = ['TYPE ABOUT.TXT', 'DIR PROJECTS', 'TYPE NOTES.TXT', 'NET CONTACT'];
  const commands = {
    'TYPE ABOUT.TXT': 'about-template',
    'DIR PROJECTS': 'projects-template',
    'DIR': 'projects-template',
    'TYPE NOTES.TXT': 'notes-template',
    'NET CONTACT': 'contact-template',
    'TYPE CONTACT.DAT': 'contact-template',
    'TYPE COLAB.TXT': 'colab-template',
    'TYPE NEURASENSE.TXT': 'neurasense-template',
    'TYPE VIBE.TXT': 'vibe-template',
    'EMAIL': 'contact-template'
  };
  const aliases = {'COLAB.EXE': 'TYPE COLAB.TXT', 'NEURASENSE.WEB': 'TYPE NEURASENSE.TXT', 'VIBE.PROTO': 'TYPE VIBE.TXT'};
  const history = [];
  let historyAt = 0;
  let typingTimer = null;
  const done = new Set();

  function nextCommand() {
    return sequence.find(command => !done.has(command)) || '';
  }

  function typeCommand(command) {
    if (typingTimer) clearInterval(typingTimer);
    typingTimer = null;
    input.value = '';
    input.readOnly = true;
    enterButton.hidden = true;
    hint.textContent = 'TYPING...';
    let position = 0;
    const finish = () => {
      if (typingTimer) clearInterval(typingTimer);
      typingTimer = null;
      input.value = command;
      input.readOnly = false;
      enterButton.hidden = false;
      hint.textContent = 'Press Enter to run ' + command + '. Tap the Enter key on mobile.';
    };
    if (reducedMotion.matches) {
      finish();
      return;
    }
    typingTimer = setInterval(() => {
      position += 1;
      input.value = command.slice(0, position);
      if (position >= command.length) finish();
    }, 55);
  }

  function setPrompt() {
    const next = nextCommand();
    input.placeholder = next ? '' : 'TYPE HELP OR A COMMAND';
    quick.hidden = Boolean(next);
    if (next) {
      typeCommand(next);
      return;
    }
    if (typingTimer) clearInterval(typingTimer);
    typingTimer = null;
    input.value = '';
    input.readOnly = false;
    enterButton.hidden = true;
    hint.textContent = 'Type a command, or choose one below and press Enter.';
    if (!next) {
      quick.replaceChildren();
      for (const command of ['DIR PROJECTS', 'TYPE COLAB.TXT', 'TYPE NOTES.TXT', 'NET CONTACT', 'HELP']) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = command;
        button.addEventListener('click', () => {
          typeCommand(command);
          button.blur();
        });
        quick.append(button);
      }
    }
  }

  function appendCommand(command) {
    const line = document.createElement('p');
    line.className = 'executed';
    const path = document.createElement('span');
    path.textContent = 'i:\\>';
    line.append(path, document.createTextNode(' ' + command));
    transcript.append(line);
  }

  function appendMessage(message) {
    const line = document.createElement('p');
    line.className = 'system-message';
    line.textContent = message;
    transcript.append(line);
  }

  function render(templateId) {
    const template = document.getElementById(templateId);
    const fragment = template.content.cloneNode(true);
    fragment.querySelectorAll('[data-command]').forEach(button => {
      button.addEventListener('click', () => {
        typeCommand(button.dataset.command);
        button.blur();
        form.scrollIntoView({behavior: 'smooth', block: 'end'});
      });
    });
    const emailForm = fragment.querySelector('[data-email-form]');
    if (emailForm) {
      emailForm.addEventListener('submit', event => {
        event.preventDefault();
        const data = new FormData(emailForm);
        const subject = String(data.get('subject') || '').trim();
        const body = String(data.get('body') || '').trim();
        if (!subject || !body) {
          emailForm.reportValidity();
          return;
        }
        const url = 'mailto:sa555ranga@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        window.location.href = url;
      });
    }
    transcript.append(fragment);
  }

  function run(raw) {
    const command = raw.trim().replace(/\s+/g, ' ').toUpperCase();
    if (!command) return;
    appendCommand(command);
    history.push(command);
    historyAt = history.length;
    const resolved = aliases[command] || command;
    if (command === 'CLS' || command === 'CLEAR') {
      transcript.replaceChildren();
      appendMessage('Screen cleared. Files remain where you left them.');
    } else if (command === 'HELP' || command === '?') {
      appendMessage('COMMANDS: DIR PROJECTS · TYPE ABOUT.TXT · TYPE NOTES.TXT · NET CONTACT · TYPE COLAB.TXT · TYPE NEURASENSE.TXT · TYPE VIBE.TXT · CLS');
    } else if (commands[resolved]) {
      render(commands[resolved]);
      done.add(resolved);
    } else {
      appendMessage('Bad command or file name: ' + command + '. Type HELP for a list.');
    }
    setPrompt();
    requestAnimationFrame(() => {
      const last = transcript.lastElementChild;
      if (last) last.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (typingTimer || enterButton.hidden) return;
    run(input.value);
  });
  input.addEventListener('input', () => {
    if (typingTimer) return;
    const command = input.value.trim();
    enterButton.hidden = !command;
    hint.textContent = command ? 'Press Enter to run ' + command.toUpperCase() + '.' : 'Type a command, or choose one below and press Enter.';
  });
  input.addEventListener('keydown', event => {
    if (input.readOnly) return;
    if (event.key === 'ArrowUp' && history.length) {
      event.preventDefault();
      historyAt = Math.max(0, historyAt - 1);
      input.value = history[historyAt];
      enterButton.hidden = false;
    } else if (event.key === 'ArrowDown' && history.length) {
      event.preventDefault();
      historyAt = Math.min(history.length, historyAt + 1);
      input.value = history[historyAt] || '';
      enterButton.hidden = !input.value;
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.defaultPrevented || event.repeat || event.isComposing) return;
    const active = document.activeElement;
    if (active && active !== document.body && active !== document.documentElement) return;
    if (enterButton.hidden || typingTimer) return;
    event.preventDefault();
    run(input.value);
  });
  document.querySelector('#top-button').addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
  setPrompt();
})();
