alter table public.site_settings
add column if not exists hero_video_url text;

update public.site_settings
set hero_video_url = coalesce(hero_video_url, '/video/video.mp4')
where id = 1;
