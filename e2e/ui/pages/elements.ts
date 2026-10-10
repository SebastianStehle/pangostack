import { Locator, Page } from '@playwright/test';

// Modals have no dialog role, so they are found by their heading.
export function getDialog(page: Page, title: string) {
  return page.locator('div.rounded-xl', { has: page.getByRole('heading', { name: title, exact: true }) });
}

export function getFormRow(page: Page, label: string) {
  return page.locator('.form-row', { hasText: label });
}

// Ace and CodeMirror do not use a plain input, so the value is set through their own API on the DOM element.
export async function fillCodeEditor(container: Locator, value: string) {
  await container.locator('.ace_editor').evaluate((element, text) => {
    (element as any).env.editor.setValue(text, 1);
  }, value);
}

export async function fillMarkdownEditor(container: Locator, value: string) {
  await container.locator('.CodeMirror').evaluate((element, text) => {
    (element as any).CodeMirror.setValue(text);
  }, value);
}
