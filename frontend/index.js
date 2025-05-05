const getTest = () => {
    API.getUsers().then(
        (res) => {
            console.log(res);
            document.getElementById("result-text").textContent = res.message;
        },
        (err) => {
            document.getElementById("result-text").textContent = res.message;
        },
    );
};