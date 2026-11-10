export const BrowserRouter = ({ children }) => <div>{children}</div>;
export const Routes = ({ children }) => <div>{children}</div>;
export const Route = ({ element }) => element;
export const Navigate = () => <div>Navigate</div>;
export const useNavigate = () => jest.fn();
