// console.log("running");

(function () {
    //////////////// VUE COMPONENT ////////////////
    Vue.component("modal-component", {
        // first argument: "modal-component" = name of component

        template: "#modal-template", // second argument: object with id/# ("modal-template") in script-tag in index.html

        props: ["modalTitle", "id"], // array, names camelCase, refers to modal inside main div in index.html

        mounted: function () {
            console.log(
                "script.js, modalTitle in mounted of my component:",
                this.modalTitle
            );
            console.log("script.js, Vue.component, mounted, id:", this.id);
            var each = this;
            // we can now make an axios-request to the server sending the id and ask
            // for all the information about that id, get.then.catch
        }, // mounted ends

        data: function () {
            // data as a function which returns an object
            return {
                // returns a "fresh" copy of the data in main Vue
                // toggle: false,

                image: {
                    // whateverWeGetBackFromTheServer
                    count: 0, // do I need this?
                    url: "",
                    title: "",
                    description: "",
                    username: "",
                },
            };
        }, // data ends

        methods: {
            closeModal: function () {
                console.log(
                    "script.js, Vue.component, method closeModal, emitting"
                );
                this.$emit("close");
            },
            // ANOTHER FUNCTION FOR SUBMITTING COMMENTS, including axios post
        }, // methods end
    });

    //////////////// NEW VUE ////////////////
    new Vue({
        el: "#main",

        data: {
            selectedImage: null,
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
        }, // data ends

        mounted: function () {
            console.log("script.js, my main Vue has mounted!");

            var each = this;
            console.log("script.js, each before axios in main Vue:", each);

            axios
                .get("/images")
                .then(function (response) {
                    each.images = response.data;
                    console.log(
                        "script.js, each.images after axios in main Vue:",
                        each.images
                    );
                })
                .catch(function (err) {
                    console.log(
                        "script.js, catch in axios.get /images in main Vue:",
                        err
                    );
                });
        }, // mounted ends

        methods: {
            uploadButtonClick: function (e) {
                // prevents the page from reloading:
                e.preventDefault();

                // 'this' allows me to see all the properties of data
                console.log("script.js, this in methods in main Vue:", this);

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
                            "script.js, POST /upload in axios in methods in main Vue, resp:",
                            resp
                        );
                        console.log(
                            "script.js, POST /upload in axios in methods in main Vue, resp.data.userInsert:",
                            resp.data.userInsert
                        );
                        // data from index.js added to index 0 in data in this file:
                        each.images.unshift(resp.data.userInsert);
                    })
                    .catch(function (err) {
                        console.log(
                            "script.js, catch in axios POST /upload in methods in main Vue:",
                            err
                        );
                    });
                // this is how we send information from front to back
                // clear input fields:
                this.title = "";
                this.description = "";
                this.username = "";
                // this.file = null; // does not work
                this.$refs.file.value = "";
            },
            handleChange: function (e) {
                console.log(
                    "script.js, handleChange is running in methods in main Vue"
                );
                console.log(
                    "script.js, file in handleChange in methods in main Vue:",
                    e.target.files[0]
                );
                this.file = e.target.files[0];
            },
            closeModal: function () {
                console.log(
                    "script.js, closeModal is running in methods in main Vue"
                );
                this.selectedImage = null;
            },
        }, // methods end
    });
})();
