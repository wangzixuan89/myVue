    <template>
        <div>
            <h1>首页</h1>
            <button @click="handleLogout">退出登录</button>
        </div>
    </template>
    
    <script setup lang="ts">
    import { useRouter } from 'vue-router';
    const route = useRouter();

    const handleLogout = () => {
        route.push('/login')
    }
    </script>
    
    <style scoped>
    
    </style>