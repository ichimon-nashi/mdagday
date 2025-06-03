const Navbar = ({ userDetails, title = "豪神組員任務互換APP", onLogout }) => {
    // Handler for logout
    const handleLogout = () => {
        if (onLogout) {
            onLogout(); // Call parent logout function
        } else {
            window.location.reload(); // Fallback to page reload
        }
    };

    // Remove the handleBack function since we're not using routing
    // If you need navigation, you can handle it differently

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
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-title">{title}</div>
                <div className="navbar-right">
                    <div>
                        <p className="navbar-welcomeMsg">Hi, {navbarNickname()}</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="logoutButton"
                    >
                        登出
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;