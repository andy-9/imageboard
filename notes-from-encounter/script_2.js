// console.log("running");

(function () {
    new Vue({
        // "el" represents which element in our html will have access in our Vue code!
        el: "#main",
        data: {
            name: "msg",
            seen: false,
            cities: [],
        }, // data ends
        mounted: function () {
            console.log("my Vue has mounted!");
            console.log("this:", this);

            var self = this;

            axios
                .get("/cities")
                // // we always have to pass an argument:
                .then(function (response) {
                    //     console.log("response from /cities:", response.data);
                    // });

                    self.cities = response.data;
                    console.log("self:", self);

                    // perfect time if there are images to retrieve from our database + render them on screen!
                });
        }, // mounted ends
        methods: {
            myFunction: function () {
                console.log("myFunction is running!");
            },
        }, // methods end
    });
})();
