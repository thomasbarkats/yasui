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
    title: 'Fondateur & Architecte Principal',
    desc: 'A initié YasuiJS et dirigé le développement. A conçu l\'architecture et les concepts fondamentaux.',
    links: [
      { icon: 'github', link: 'https://github.com/thomasbarkats' },
    ]
  },
  {
    avatar: 'https://www.github.com/alexandre-hallaine.png',
    name: 'Alexandre Hallaine',
    title: 'Développeur Principal',
    desc: 'A rejoint le projet en 2025 pour moderniser le projet avec des outils à jour.',
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
      Notre Équipe
    </template>
    <template #lead>
      Le développement de YasuiJS est guidé par une équipe internationale,
      dont certains membres ont choisi d'être présentés ci-dessous.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members />
</VPTeamPage>