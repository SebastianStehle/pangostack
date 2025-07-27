import { memo } from 'react';
import { MessageContentDto } from 'src/api';
import { Markdown } from 'src/components';

export const ChatItemContent = memo(({ content }: { content: MessageContentDto[] }) => {
  return (
    <>
      {content.map((chunk, i) => (
        <div key={i}>
          {chunk.type === 'text' && <Markdown>{chunk.text}</Markdown>}

          {chunk.type === 'image_url' && <img src={chunk.image.url} />}
        </div>
      ))}
    </>
  );
});
