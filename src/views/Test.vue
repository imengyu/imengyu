<template>
  <TextNetworkGraph :data="learningData" />
</template>

<script lang="ts">
import Const from '@/const/Const';
import { getLearningData } from '@/const/LearningData'
import { defineComponent } from 'vue'
import TextNetworkGraph from '../components/TextNetworkGraph.vue'

export default defineComponent({
  data() {
    return {
      learningData: getLearningData(),
    }
  },
  components: {
    TextNetworkGraph
  },
  methods: {
    hideLoadingMask() {
      const loading = document.getElementById('imengyu-loading-mask');
      if(loading) {
        loading.classList.add('hide');
        setTimeout(() => {
          loading.style.display = 'none';
        }, 300)
      }
    }
  },
  mounted() {
    document.title = 'Test - ' + Const.SiteName;
    setTimeout(() => this.hideLoadingMask())
  }
})
</script>
