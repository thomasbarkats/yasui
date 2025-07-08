---
layout: page
sidebar: false
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/thomasbarkats.png',
    name: 'Thomas Barkats',
    title: '创始人 & 首席架构师',
    desc: '发起YasuiJS并领导开发。设计了核心架构和概念。',
    links: [
      { icon: 'github', link: 'https://github.com/thomasbarkats' },
    ]
  },
  {
    avatar: 'https://www.github.com/alexandre-hallaine.png',
    name: 'Alexandre Hallaine',
    title: '核心开发者',
    desc: '2025年加入，使用最新工具对项目进行现代化改造。',
    links: [
      { icon: 'github', link: 'https://github.com/alexandre-hallaine' },
    ]
  },
]
</script>

<style>
  .VPTeamPageTitle {
    padding-top: 0 !important;
  }
  @media (min-width: 768px) {
    .VPTeamPage[data-v-5f7da39d] {
        margin: 96px 0;
    }
  }
</style>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      我们的团队
    </template>
    <template #lead>
      YasuiJS的开发由一个国际团队指导，
      其中一些成员选择在下方展示。
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members />
</VPTeamPage>