import { onMounted, onBeforeUnmount, reactive, toRefs, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex'
import { isAffix } from './useTags'

export const useContextMenu = (tagList) => {
  const store = useStore()
  const router = useRouter()
  const route = useRoute()

  const state = reactive({
    visible: false,
    top: 0,
    left: 0,
    selectedTag: {},
    openMenu (tag, e) {
      state.visible = true;
      state.left = e.clientX;
      state.top = e.clientY;
      state.selectedTag = tag;
    },
    closeMenu () {
      state.visible = false;
    },
    refreshSelectedTag (tag) {
      store.dispatch("tags/delCacheList", tag)
      const { fullPath } = tag;
      nextTick(() => {
        router.replace({
          path: "/redirect" + fullPath,
        });
      });
    },
    closeTag (tag) {
      if (isAffix(tag)) return;

      const closedTagIndex = tagList.value.findIndex(
        (item) => item.fullPath === tag.fullPath
      );
      store.dispatch("tags/delTag", tag)
      if (isActive(tag)) {
        toLastTag(closedTagIndex - 1);
      }
    },
    closeOtherTags () {
      store.dispatch("tags/delOtherTags", state.selectedTag)
      router.push(state.selectedTag);
    },
    closeAllTags () {
      store.dispatch("tags/delAllTags")
      router.push("/");
    }
  })

  const isActive = (tag) => {
    return tag.fullPath === route.fullPath;
  }

  const toLastTag = (lastTagIndex) => {
    const lastTag = tagList.value[lastTagIndex];
    if (!!lastTag) {
      router.push(lastTag.fullPath);
    } else {
      router.push("/");
    }
  }

  onMounted(() => {
    document.addEventListener("click", state.closeMenu);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("click", state.closeMenu);
  });

  return toRefs(state)
}