import type { AppRouter } from '@backend/routes/router';
import { createTRPCContext } from '@trpc/tanstack-react-query';

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();
