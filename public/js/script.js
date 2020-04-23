// console.log("running");

(function () {
    new Vue({
        el: "#main",
        data: {
            images: [],
        }, // data ends
        mounted: function () {
            console.log("my Vue has mounted!");

            var each = this;
            console.log("script.js, each before axios:", each);

            axios.get("/images").then(function (response) {
                each.images = response.data;
                console.log("script.js, each.images after axios:", each.images);
            });
        }, // mounted ends
        methods: {
            // myFunction: function () {
            //     console.log("myFunction is running!");
            // },
        }, // methods end
    });
})();
