// vite.config.ts
import { defineConfig } from "file:///C:/Faks/Arhitektura%20i%20projektovanje%20softvera/Projekat_novije/GuessTheSketch/node_modules/vitest/dist/config.js";
import react from "file:///C:/Faks/Arhitektura%20i%20projektovanje%20softvera/Projekat_novije/GuessTheSketch/node_modules/@vitejs/plugin-react/dist/index.mjs";
import tailwindcss from "file:///C:/Faks/Arhitektura%20i%20projektovanje%20softvera/Projekat_novije/GuessTheSketch/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "src/setupTests",
    mockReset: true
  },
  server: {
    hmr: false
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxGYWtzXFxcXEFyaGl0ZWt0dXJhIGkgcHJvamVrdG92YW5qZSBzb2Z0dmVyYVxcXFxQcm9qZWthdF9ub3ZpamVcXFxcR3Vlc3NUaGVTa2V0Y2hcXFxccGFja2FnZXNcXFxcY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxGYWtzXFxcXEFyaGl0ZWt0dXJhIGkgcHJvamVrdG92YW5qZSBzb2Z0dmVyYVxcXFxQcm9qZWthdF9ub3ZpamVcXFxcR3Vlc3NUaGVTa2V0Y2hcXFxccGFja2FnZXNcXFxcY2xpZW50XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9GYWtzL0FyaGl0ZWt0dXJhJTIwaSUyMHByb2pla3RvdmFuamUlMjBzb2Z0dmVyYS9Qcm9qZWthdF9ub3ZpamUvR3Vlc3NUaGVTa2V0Y2gvcGFja2FnZXMvY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVzdC9jb25maWdcIlxyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCJcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gXCJAdGFpbHdpbmRjc3Mvdml0ZVwiXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpXSxcclxuICB0ZXN0OiB7XHJcbiAgICBnbG9iYWxzOiB0cnVlLFxyXG4gICAgZW52aXJvbm1lbnQ6IFwianNkb21cIixcclxuICAgIHNldHVwRmlsZXM6IFwic3JjL3NldHVwVGVzdHNcIixcclxuICAgIG1vY2tSZXNldDogdHJ1ZSxcclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgaG1yOiBmYWxzZSxcclxuICB9LFxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVkLFNBQVMsb0JBQW9CO0FBQ3BmLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUd4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztBQUFBLEVBQ2hDLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxJQUNaLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixLQUFLO0FBQUEsRUFDUDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
