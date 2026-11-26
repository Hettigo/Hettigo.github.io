(() => {
  const transcript = document.querySelector('#transcript');
  const form = document.querySelector('#prompt-form');
  const input = document.querySelector('#command-input');
  const hint = document.querySelector('#hint');
  const quick = document.querySelector('#quick-commands');
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
  const done = new Set();

  function nextCommand() {
    return sequence.find(command => !done.has(command)) || '';
  }

  function setPrompt() {
    const next = nextCommand();
    input.value = next;
    input.placeholder = next ? '' : 'TYPE HELP OR A COMMAND';
    hint.textContent = next
      ? 'Press Enter to run ' + next + '. Tap the Enter key on mobile.'
      : 'Type a command, or choose one below and press Enter.';
    quick.hidden = Boolean(next);
    if (!next) {
      quick.replaceChildren();
      for (const command of ['DIR PROJECTS', 'TYPE COLAB.TXT', 'TYPE NOTES.TXT', 'NET CONTACT', 'HELP']) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = command;
        button.addEventListener('click', () => {
          input.value = command;
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
        input.value = button.dataset.command;
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
    run(input.value);
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowUp' && history.length) {
      event.preventDefault();
      historyAt = Math.max(0, historyAt - 1);
      input.value = history[historyAt];
    } else if (event.key === 'ArrowDown' && history.length) {
      event.preventDefault();
      historyAt = Math.min(history.length, historyAt + 1);
      input.value = history[historyAt] || '';
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.defaultPrevented || event.repeat || event.isComposing) return;
    const active = document.activeElement;
    if (active && active !== document.body && active !== document.documentElement) return;
    if (!nextCommand()) return;
    event.preventDefault();
    run(input.value);
  });
  document.querySelector('#top-button').addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
  setPrompt();
})();
