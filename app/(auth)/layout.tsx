
const AuthLayout = ({
    children 
}: {
    children: React.ReactNode
}) => {
  return (
    <div className="flex justify-center py-24">
      {children}
      </div>
  )
}

export default AuthLayout