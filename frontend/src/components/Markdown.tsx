import ReactMarkdown from 'react-markdown';
import { Prism } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Icon } from './Icon';

/* eslint-disable @typescript-eslint/no-unused-vars */

export interface MarkdownProps {
  // The content to render.
  children: string | null | undefined;
}

export const Markdown = (props: MarkdownProps) => {
  const { children } = props;

  return (
    <ReactMarkdown className="markdown" components={{ a: LinkRenderer, code: Code }}>
      {children}
    </ReactMarkdown>
  );
};

function LinkRenderer(props: any) {
  return (
    <a href={props.href} target="_blank" rel="noreferrer">
      <Icon className="!-mb-[1px] inline-block align-baseline" icon="external-link" size={12} />
      {props.children}
    </a>
  );
}

function Code(props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>) {
  const { children, className, ref, ...other } = props;

  const match = /language-(\w+)/.exec(className || '');

  return match ? (
    <Prism {...other} PreTag="div" children={String(children).replace(/\n$/, '')} language={match[1]} style={a11yDark} />
  ) : (
    <code {...other} className={className}>
      {children}
    </code>
  );
}
