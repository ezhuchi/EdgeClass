// Empty State Component
const EmptyState = ({ icon: Icon, iconProps = {}, title, description, action }) => (
  <div className="text-center py-12 px-4">
    <div className="mb-4 flex justify-center">
      <Icon size={64} weight="duotone" className="text-gray-400" {...iconProps} />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className={`btn ${action.primary ? 'btn-primary' : 'btn-secondary'}`}
      >
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
