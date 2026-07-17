import { Logger } from '@nestjs/common';

// Keep the test output clean: the code under test intentionally logs warnings and errors (e.g. a
// missing metrics server, or a failing resource apply), which are noise when running the suite.
Logger.overrideLogger(false);
