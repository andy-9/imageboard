// console.log("running");

(function () {
    Vue.config.ignoredElements = [/^ion-/];

    //////////////// VUE COMPONENT ////////////////
    Vue.component("modal-component", {
        // first argument: "modal-component" = name of component

        template: "#modal-template", // second argument: object with id/# ("modal-template") in script-tag in index.html

        props: ["id"], // array, names camelCase, refers to modal inside main div in index.html

        mounted: function () {
            this.modalInfo();
        },
        // mounted ends

        watch: {
            id: function () {
                console.log(
                    "script.js: selectedImage changed, this is the watcher reporting."
                );
                this.modalInfo();
            },
        }, // watch ends

        data: function () {
            // data as a function which returns an object
            return {
                // returns a "fresh" copy of the data in main Vue
                image: {},
                comments: [],
                username: "",
                comment: "",
                created_at: "",
            };
        }, // data ends

        methods: {
            // get modal infos (image, input fields, id, date)
            modalInfo: function () {
                var each = this;
                console.log(
                    "script.js, id in mounted in my Vue.component:",
                    each.id
                ); // refers to modal inside main div in index.html

                // axios-request to the server.js sending the id --> get all the information for that id
                axios
                    .get("/modal-id/" + each.id)
                    .then(function (response) {
                        console.log(
                            "script.js, axios in Vue component, response.data",
                            response.data
                        );

                        // close modal when id doesn't exist or is no number
                        if (
                            response.data[0] === null ||
                            response.data === "noNumber"
                        ) {
                            each.$emit("close");
                        } else {
                            each.image = response.data[0];
                            console.log(
                                "script.js, each.image after axios in Vue.component:",
                                each.image
                            );
                            each.comments = response.data[1];
                            console.log(
                                "script.js, each.comments after axios in Vue.component:",
                                each.comments
                            );
                        }
                        // the above is passed to "data" a few lines below
                    })
                    .catch(function (err) {
                        console.log(
                            "CATCH in script.js in axios.get /modal-id/:id in Vue.component:",
                            err
                        );
                        each.$emit("close");
                    });
            },

            // get current comment
            postComment: function (e) {
                // prevents the page from reloading:
                e.preventDefault();
                // 'this' allows me to see all the properties of data

                var each = this;
                console.log(
                    "script.js, 'this' in postComment in component Vue:",
                    this
                );

                var commentInfo = {
                    username: this.username,
                    comment: this.comment,
                    image_id: this.id,
                };
                console.log(
                    "script.js, method postComment, commentInfo:",
                    commentInfo
                );

                axios
                    .post("/comment", commentInfo)
                    .then(function (response) {
                        console.log(
                            "script.js, POST /comment in axios in methods in component Vue, getComment.data:",
                            response.data
                        );
                        console.log(
                            "script.js, POST /comment in axios in methods in component Vue, resp.data.userProp:",
                            response.data.userProp
                        );
                        // data from index.js added to index 0 in data in this file:
                        each.comments.unshift(response.data.userProp);
                    })
                    .catch(function (err) {
                        console.log(
                            "CATCH in script.js in axios POST /comment in methods in component Vue:",
                            err
                        );
                    });
                // clear input fields:
                this.comment = "";
                this.username = "";
            },

            // close modal
            closeModal: function () {
                console.log(
                    "script.js, Vue.component, method closeModal, emitting"
                );
                this.$emit("close");
            },
        }, // methods end
    });

    //////////////// NEW VUE ////////////////
    new Vue({
        el: "#main",

        data: {
            // seen: true,
            images: [],
            // make modal pop open automatically when page initially loads, gives us link sharing functionality:
            selectedImage: location.hash.slice(1),
            // selectedImage: null,
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
                        "CATCH in script.js in axios.get /images in main Vue:",
                        err
                    );
                });

            window.addEventListener("hashchange", function () {
                console.log("script.js, hashchange has fired!");
                console.log("script.js, location.hash:", location.hash);

                each.selectedImage = location.hash.slice(1);
                // console.log("script.js, each:", each);
            });
        }, // mounted ends

        methods: {
            uploadButtonClick: function (e) {
                // prevents the page from reloading:
                e.preventDefault();

                // 'this' allows me to see all the properties of data
                console.log("script.js, 'this' in methods in main Vue:", this);

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
                            "CATCH in script.js in axios POST /upload in methods in main Vue:",
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
                location.hash = "";
            },
        }, // methods end
    });
})();
