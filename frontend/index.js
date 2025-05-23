const getTest = () => {
    API.getUsers().then(
        (res) => {
            console.log(res);
            document.getElementById("result-text").textContent = res;
        },
        (err) => {
            document.getElementById("result-text").textContent = err;
        },
    );
};