const copyThroughSelection = (text: string): boolean => {
  const field = document.createElement('textarea');

  field.value = text;
  field.readOnly = true;
  field.style.position = 'fixed';
  field.style.opacity = '0';

  document.body.append(field);
  field.select();

  const isCopied = document.execCommand('copy');

  field.remove();

  return isCopied;
};

export const writeClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    if (!copyThroughSelection(text)) {
      throw error;
    }
  }
};
