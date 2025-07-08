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
    title: 'Founder & Lead Architect',
    desc: 'Initiated YasuiJS and led development. Designed the core architecture and concepts.',
    links: [
      { icon: 'github', link: 'https://github.com/thomasbarkats' },
    ]
  },
  {
    avatar: 'https://www.github.com/alexandre-hallaine.png',
    name: 'Alexandre Hallaine',
    title: 'Core Developer',
    desc: 'Joined in 2025 to modernize the project with up-to-date tooling.',
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
      Our Team
    </template>
    <template #lead>
      The development of YasuiJS is guided by an international
      team, some of whom have chosen to be featured below.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members />
</VPTeamPage>
