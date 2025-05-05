const API = {
    api: axios.create({baseUrl: "http://localhost:8080"}),

    getUsers() {
        return this.api
            .get("/users")
            .then((response) => response.data);
    },
};
