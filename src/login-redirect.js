const loginRedirect = (history) => {
    if (!history) {
        console.error('Missing history parameter in loginRedirect');
        return;
    }
    
    const loginRedirect = localStorage.getItem('loginRedirect')
    if (loginRedirect) {
        localStorage.removeItem('loginRedirect');
        history.replace(loginRedirect);
    }
};

export default loginRedirect;