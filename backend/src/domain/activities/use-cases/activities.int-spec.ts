import { TypeOrmModule } from '@nestjs/typeorm';
import { createIntegrationTest, IntegrationTestContext, seedTeam, seedUser, uniqueId } from 'test/integration/setup';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TeamActivityEntity, UserEntity } from 'src/domain/database';
import { GetTeamActivitiesHandler, GetTeamActivitiesQuery, GetTeamActivitiesResult } from '.';

const DEPLOYMENT_ID = 4242;

describe('activities handlers', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await createIntegrationTest({
      imports: [TypeOrmModule.forFeature([TeamActivityEntity, UserEntity])],
      providers: [GetTeamActivitiesHandler],
    });
  });

  afterAll(async () => {
    await context.close();
  });

  describe('GetTeamActivitiesQuery', () => {
    it('should return the activities of a team and resolve the acting user', async () => {
      const team = await seedTeam(context.dataSource);
      const user = await seedUser(context.dataSource);
      const activities = context.dataSource.getRepository(TeamActivityEntity);
      await activities.save({ teamId: team.id, key: uniqueId('key'), parameters: {}, createdBy: user.id });
      await activities.save({ teamId: team.id, key: uniqueId('key'), parameters: {}, createdBy: null });

      const { activities: result, total } = await context.queryBus.execute<GetTeamActivitiesQuery, GetTeamActivitiesResult>(
        new GetTeamActivitiesQuery(team.id),
      );

      expect(total).toBe(2);
      expect(result.find((activity) => activity.createdBy?.id === user.id)).toBeDefined();
      expect(result.find((activity) => activity.createdBy === null)).toBeDefined();
    });

    it('should filter the activities by deployment', async () => {
      const team = await seedTeam(context.dataSource);
      const activities = context.dataSource.getRepository(TeamActivityEntity);
      await activities.save({ teamId: team.id, key: uniqueId('key'), parameters: {}, deploymentId: DEPLOYMENT_ID });
      await activities.save({ teamId: team.id, key: uniqueId('key'), parameters: {}, deploymentId: null });

      const { activities: result, total } = await context.queryBus.execute<GetTeamActivitiesQuery, GetTeamActivitiesResult>(
        new GetTeamActivitiesQuery(team.id, 0, 20, DEPLOYMENT_ID),
      );

      expect(total).toBe(1);
      expect(result[0].deploymentId).toBe(DEPLOYMENT_ID);
    });

    it('should return nothing for a team without activities', async () => {
      const team = await seedTeam(context.dataSource);

      const { activities: result, total } = await context.queryBus.execute<GetTeamActivitiesQuery, GetTeamActivitiesResult>(
        new GetTeamActivitiesQuery(team.id),
      );

      expect(total).toBe(0);
      expect(result).toEqual([]);
    });
  });
});
