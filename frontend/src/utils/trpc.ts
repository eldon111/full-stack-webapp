import { AppRouter } from '@emathias-web-app/backend-routes';
import { createTRPCContext } from '@trpc/tanstack-react-query';

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();
