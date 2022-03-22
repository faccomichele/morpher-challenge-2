<template>
  <div class="container">
    <h3> Total: {{total}}</h3>
  </div>
  <button type="button" @click="increment">Increment!</button>
</template>

<script>
  import axios from 'axios';
  
  const apihost = process.env.VUE_APP_BE_HOST;
  const apiport = process.env.VUE_APP_BE_PORT;
      
  export default {
    name: 'TotalApp',
    data() {
      return {
        total: null,
        timer: "",
      };
    },
    created: function() {
      this.fetchData();
      this.timer = setInterval(this.fetchData, 5000);
    },  
    methods: {
      async fetchData() {
        axios
          .get(`http://${apihost}:${apiport}/get`)
          .then(res => {
            if(res.status == 200){
              this.total = res.data.total;
            } else {
              console.log("Server returned " + res.status + " : " + res.statusText);
            }
          })
          .catch(err => {
            console.log(err);
          });
      },
      cancelAutoUpdate() {
        clearInterval(this.timer);
      },
      increment() {
        axios
          .get(`http://${apihost}:${apiport}/add`)
          .catch(err => {
            console.log(err);
          });
        this.fetchData();
      },
    },
    beforeUnmount() {
      this.cancelAutoUpdate();
    },
  };
</script>
        
<style>
  h3 {
    margin-bottom: 5%;
  }
</style>