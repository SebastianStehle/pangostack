import { Body, Controller, Get, Post, Query, Redirect, Req, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { GithubAuthGuard, GoogleAuthGuard, LocalAuthGuard, MicrosoftAuthGuard, OAuthAuthGuard } from 'src/domain/auth';
import { AuthService } from 'src/domain/auth/auth.service';
import { NotificationsService } from 'src/domain/notifications';
import { UrlService } from 'src/lib';
import { AuthSettingsDto, LoginDto, ProfileDto } from './dtos';

@Controller('api/auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly notifications: NotificationsService,
    private readonly urlService: UrlService,
  ) {}

  @Get('settings')
  @ApiOperation({ operationId: 'getAuthSettings', description: 'The settings.' })
  @ApiOkResponse({ type: AuthSettingsDto })
  getSettings() {
    const config = this.authService.config;

    return AuthSettingsDto.fromDomain(config);
  }

  @Get('profile')
  @ApiOperation({ operationId: 'getProfile', description: 'Provides the profile.' })
  @ApiOkResponse({ type: ProfileDto })
  @UseGuards(LocalAuthGuard)
  async getProfile(@Req() req: Request) {
    const notifo = await this.notifications.getToken(req.user.id);
    return ProfileDto.fromDomain(req.user, notifo);
  }

  @Get('logout')
  @ApiExcludeEndpoint()
  @Redirect()
  async getLogout(@Req() req: Request, @Query('redirectUrl') redirectUrl?: string) {
    await this.authService.logout(req);
    return this.getRedirectUrl(req, redirectUrl);
  }

  @Post('login')
  @ApiOperation({ operationId: 'login', description: 'Login completed.' })
  @ApiNoContentResponse()
  async login(@Req() req: Request, @Body() body: LoginDto) {
    await this.authService.loginWithPassword(body.email, body.password, req);
  }

  @Get('login/github')
  @ApiExcludeEndpoint()
  @Redirect()
  @UseGuards(GithubAuthGuard)
  async githubAuth() {}

  @Get('login/github/callback')
  @ApiExcludeEndpoint()
  @Redirect()
  @UseGuards(GithubAuthGuard)
  async githubAuthCallback(@Req() req: Request, @Query('state') state: string) {
    await this.authService.login(req.user, req);
    return this.getRedirectUrl(req, state);
  }

  @Get('login/google')
  @ApiExcludeEndpoint()
  @Redirect()
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('login/google/callback')
  @ApiExcludeEndpoint()
  @Redirect()
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Query('state') state: string) {
    await this.authService.login(req.user, req);
    return this.getRedirectUrl(req, state);
  }

  @Get('login/microsoft')
  @ApiExcludeEndpoint()
  @Redirect()
  @UseGuards(MicrosoftAuthGuard)
  async microsoftAuth() {}

  @Get('login/microsoft/callback')
  @ApiExcludeEndpoint()
  @Redirect()
  @UseGuards(MicrosoftAuthGuard)
  async microsoftAuthCallback(@Req() req: Request, @Query('state') state: string) {
    await this.authService.login(req.user, req);
    return this.getRedirectUrl(req, state);
  }

  @Get('login/oauth')
  @ApiExcludeEndpoint()
  @Redirect()
  @UseGuards(OAuthAuthGuard)
  async oauthAuth() {}

  @Get('login/oauth/callback')
  @ApiExcludeEndpoint()
  @Redirect()
  @UseGuards(OAuthAuthGuard)
  async oauthAuthCallback(@Req() req: Request, @Query('state') state: string) {
    await this.authService.login(req.user, req);
    return this.getRedirectUrl(req, state);
  }

  private getRedirectUrl(req: Request, url?: string) {
    let finalUrl = url;

    if (!finalUrl) {
      finalUrl = new URL(`${req.protocol}://${req.get('Host')}${req.originalUrl}`).origin;
    }

    if (!IS_PRODUCTION) {
      return { url: finalUrl };
    }

    if (this.urlService.isValidRedirectUrl(finalUrl)) {
      return { url: finalUrl };
    }

    return { url: this.urlService.buildUrl('/') };
  }
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
