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
    title: 'Fundador y Arquitecto Principal',
    desc: 'Inició YasuiJS y lideró el desarrollo. Diseñó la arquitectura central y los conceptos.',
    links: [
      { icon: 'github', link: 'https://github.com/thomasbarkats' },
    ]
  },
  {
    avatar: 'https://www.github.com/alexandre-hallaine.png',
    name: 'Alexandre Hallaine',
    title: 'Desarrollador Principal',
    desc: 'Se unió en 2025 para modernizar el proyecto con herramientas actualizadas.',
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
      Nuestro Equipo
    </template>
    <template #lead>
      El desarrollo de YasuiJS está guiado por un equipo
      internacional, algunos de los cuales han elegido aparecer a continuación.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members />
</VPTeamPage>