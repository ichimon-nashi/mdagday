import { useNavigate } from 'react-router-dom';

const Navbar = ({ userDetails, title = "豪神組員任務互換APP" }) => {
    const navigate = useNavigate();

    // Handler for logout
    const handleLogout = () => {
        window.location.reload();
    };

    const handleBack = () => {
        navigate('/mdaduty');
    };

    const navbarNickname = () => {
        switch(userDetails.name) {
            case "韓建豪": return "GOD";
            case "楊子翎": return "北瓜";
            case "牛仁鼎": return "🐄🐄";
            case "許惠芳": return "芳芳";
            case "陳中榆": return "陳施主";
            default: return userDetails.name.slice(1);
        }
    }

    return (
        <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-40">
            <div className="w-full flex justify-between items-center px-4">
                <div className="navbar-title text-xl font-bold">{title}</div>
                <div className="flex items-center space-x-4">
                    <div>
                        <p className="navbar-welcomeMsg">Hi, {navbarNickname()}</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="logoutButton bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm"
                    >
                        登出
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;