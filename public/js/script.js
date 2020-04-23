// console.log("running");

(function () {
    new Vue({
        el: "#main",
        data: {
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
        }, // data ends
        mounted: function () {
            console.log("script.js, my Vue has mounted!");

            var each = this;
            console.log("script.js, each before axios:", each);

            axios
                .get("/images")
                .then(function (response) {
                    each.images = response.data;
                    console.log(
                        "script.js, each.images after axios:",
                        each.images
                    );
                })
                .catch(function (err) {
                    console.log("script.js, catch in axios.get /images:", err);
                });
        }, // mounted ends
        methods: {
            handleClick: function (e) {
                // prevents the page from reloading:
                e.preventDefault();

                // 'this' allows me to see all the properties of data
                console.log("script.js, this:", this);

                // we NEED to use FormData to send a file to the server
                var formData = new FormData();
                // append() is a method in FormData to add properties in ("key", value)-pairs
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);

                var each = this;

                axios
                    .post("/upload", formData)
                    .then(function (resp) {
                        console.log(
                            "script.js, POST /upload in axios, resp:",
                            resp
                        );
                        console.log(
                            "script.js, POST /upload in axios, resp.data.userInsert:",
                            resp.data.userInsert
                        );
                        // data from index.js added to index 0 in data in this file:
                        each.images.unshift(resp.data.userInsert);
                    })
                    .catch(function (err) {
                        console.log(
                            "script.js, catch in axios POST /upload:",
                            err
                        );
                    });
                // this is how we send information from front to back
            },
            handleChange: function (e) {
                console.log("script.js, handleChange is running");
                console.log(
                    "script.js, file in handleChange:",
                    e.target.files[0]
                );
                this.file = e.target.files[0];
            },
        }, // methods end
    });
})();
