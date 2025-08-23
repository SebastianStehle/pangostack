import { useEffect, useState } from 'react';
import { useTheme } from 'src/hooks';

class Stack<T> {
  private readonly items: T[] = [];

  push(value: T) {
    this.items.push(value);
  }

  pop() {
    this.items.splice(this.items.length - 1, 1);
  }

  peek() {
    return this.items[this.items.length - 1];
  }
}

const TITLE_STACK = new Stack<string>();

export const ThemeTitle = ({ text }: { text?: string }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(text);

  useEffect(() => {
    if (!text) {
      return undefined;
    }

    TITLE_STACK.push(text);
    setTitle(TITLE_STACK.peek());

    return () => {
      TITLE_STACK.pop();
      setTitle(TITLE_STACK.peek());
    };
  }, [text]);

  useEffect(() => {
    let actualTitle = theme.name!;

    if (theme.title) {
      actualTitle = `${theme.title} - ${actualTitle}`;
    }

    if (title) {
      actualTitle = `${title} - ${actualTitle}`;
    }

    document.title = actualTitle;
  }, [theme.name, theme.title, title]);

  return <></>;
};
