import { useMemo } from 'react';
import { DeploymentDto } from 'src/api';
import { Markdown } from 'src/components';
import { evaluateExpression } from 'src/lib';

export interface InstructionsProps {
  // The deployment that contains the parameters.
  deployment: DeploymentDto;

  // The text.
  text: string;
}

export const Instructions = (props: InstructionsProps) => {
  const { deployment, text } = props;

  const fullText = useMemo(() => {
    const context = {
      parameters: deployment.parameters,
    };

    return evaluateExpression(text, context);
  }, [deployment.parameters, text]);

  return <Markdown>{fullText}</Markdown>;
};
