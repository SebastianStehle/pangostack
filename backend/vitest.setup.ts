import { Logger } from '@nestjs/common';

// Keep the test output clean: the code under test intentionally logs warnings and errors, which are
// noise when running the suite.
Logger.overrideLogger(false);
