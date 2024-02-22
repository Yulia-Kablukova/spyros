export const copyToClipboard = (str) => {
  let textarea;

  textarea = document.createElement("textarea");
  textarea.setAttribute("readonly", true);
  textarea.setAttribute("contenteditable", true);
  textarea.style.position = "fixed"; // prevent scroll from jumping to the bottom when focus is set.
  textarea.value = str;

  document.body.appendChild(textarea);

  textarea.focus();
  textarea.select();

  const range = document.createRange();
  range.selectNodeContents(textarea);

  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  textarea.setSelectionRange(0, textarea.value.length);
  document.execCommand("copy");

  document.body.removeChild(textarea);
};
