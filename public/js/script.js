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
                console.log("WATCHER in script.js: selectedImage changed!");
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
                // leftleft_id: "",
                // right_id: "",
            };
        }, // data ends

        methods: {
            // get modal infos (image, input fields, id, date)
            modalInfo: function () {
                var each = this; // refers to modal inside main div in index.html

                // axios-request to the server.js sending the id --> get all the information for that id
                axios
                    .get("/modal-id/" + each.id)
                    .then(function (response) {
                        // close modal when id doesn't exist or is no number
                        if (
                            response.data[0] === null ||
                            response.data === "noNumber"
                        ) {
                            each.$emit("close");
                        } else {
                            each.image = response.data[0];
                            each.comments = response.data[1];
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
                var commentInfo = {
                    username: this.username,
                    comment: this.comment,
                    image_id: this.id,
                };

                axios
                    .post("/comment", commentInfo)
                    .then(function (response) {
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

            // delete image
            deleteImage: function (e) {
                e.preventDefault();
                console.log(
                    "script.js, deleteImage is running in methods in Vue.component"
                );
                console.log(
                    "script.js, this.id in deleteImage in Vue component:",
                    this.id
                );
                axios.post("/delete", { id: this.id }).then((response) => {
                    console.log("deleted", response.data);
                });
                this.$emit("close");
                this.$emit("delete", this.id);
            },
        }, // methods end
    });

    //////////////// NEW VUE ////////////////
    new Vue({
        el: "#main",

        data: {
            images: [],
            // make modal pop open automatically when page initially loads, gives us link sharing functionality:
            selectedImage: location.hash.slice(1),
            // selectedImage: null,
            title: "",
            description: "",
            username: "",
            file: null,
            moreImages: true,
        }, // data ends

        mounted: function () {
            console.log("script.js, my main Vue has mounted!");
            var each = this;

            axios
                .get("/images")
                .then(function (response) {
                    // each.images = response.data.reverse();
                    each.images = response.data;
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
            });
        }, // mounted ends

        methods: {
            uploadButtonClick: function (e) {
                // prevents the page from reloading:
                e.preventDefault();
                // 'this' allows me to see all the properties of data
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
                        // data from index.js added to index 0 in data in this file:
                        each.images.unshift(resp.data.userInsert);
                    })
                    .catch(function (err) {
                        console.log(
                            "CATCH in script.js in axios POST /upload in methods in main Vue:",
                            err
                        );
                    });
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
                // console.log(
                //     "script.js, file in handleChange in methods in main Vue:",
                //     e.target.files[0]
                // );
                this.file = e.target.files[0];
            },

            loadMoreButton: function (e) {
                console.log(
                    "script.js, loadMoreButton is running in methods in main Vue"
                );
                e.preventDefault();
                var each = this;
                var lastId = {
                    lastId: this.images[this.images.length - 1].id,
                };
                axios
                    .post("/load-more", lastId)
                    .then(function (response) {
                        var lastId = response.data[response.data.length - 1].id;
                        var lowestId =
                            response.data[response.data.length - 1].lowest_id;
                        if (lastId == lowestId || response.data.length < 9) {
                            each.moreImages = false;
                        }

                        each.images.push(...response.data);
                    })
                    .catch(function (err) {
                        console.log(
                            "CATCH in script.js in axios POST /load-more in methods in main Vue:",
                            err
                        );
                    });
            },

            closeModal: function () {
                console.log(
                    "script.js, closeModal is running in methods in main Vue"
                );
                this.selectedImage = null;
                location.hash = "";
            },

            deleteImage: function (e) {
                console.log("script.js, this in deleteImage:", e);
                // loop through all images, check which id matches with deleted id. when match -> remove the image from that place
                for (var i = 0; i < this.images.length; i++) {
                    if (this.images[i].id == e) {
                        // remove 1 element from that index:
                        this.images.splice(i, 1);
                        break;
                    }
                }
            },
        }, // methods end
    });
})();
