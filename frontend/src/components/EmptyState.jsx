// Empty State Component
const EmptyState = ({ icon, title, description, action }) => (
  <div className="text-center py-12 px-4">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
    {action && action}
  </div>
);

export default EmptyState;
