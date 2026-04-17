export function createPageUrl(name) {
  const routes = {
    Home: '/',
    NewRequest: '/new-request',
    MyRequests: '/my-requests',
    RequestDetails: '/request-details',
    AdminDashboard: '/admin',
    AdminRequestDetail: '/admin/request',
  };
  if (routes[name]) return routes[name];
  // support route names with IDs like "RequestDetails/123" and queries
  if (name.startsWith('RequestDetails/')) {
    const id = name.split('/')[1];
    return `/request-details/${id}`;
  }
  if (name.startsWith('/')) return name;
  return `/${name}`;
}