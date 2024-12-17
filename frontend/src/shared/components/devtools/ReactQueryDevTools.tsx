// frontend/src/shared/components/devtools/ReactQueryDevTools.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export const ReactQueryDevTools = () => {
  return process.env.NODE_ENV === 'development' ? (
    <ReactQueryDevtools initialIsOpen={false} />
  ) : null;
}