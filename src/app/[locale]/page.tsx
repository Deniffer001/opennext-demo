import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { routing } from "@/i18n/routing";

// 定义数据类型
interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  website: string;
}

export const revalidate = 60; // 与最短的 fetch revalidate 时间一致

// 生成静态参数以支持 ISR
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// 强制静态生成，避免动态渲染
export const dynamic = "force-static";
export const dynamicParams = true;

// 服务器端数据获取函数
async function fetchPosts(): Promise<Post[]> {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts?_limit=5",
      {
        // 启用缓存，每60秒重新验证一次 (ISR)
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

async function fetchUsers(): Promise<User[]> {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/users?_limit=3",
      {
        // 启用缓存，每60秒重新验证一次 (ISR) - 与页面级别保持一致
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 启用静态生成 - 这是关键！
  setRequestLocale(locale);

  const t = await getTranslations("HomePage");

  // 添加渲染时间戳来测试缓存
  const renderTime = new Date().toISOString();
  const renderTimestamp = Date.now();

  // 在服务器端并行获取数据
  const [posts, users] = await Promise.all([fetchPosts(), fetchUsers()]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <LanguageSwitcher />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl w-full">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        {/* SSR Data Display Area */}
        <div className="w-full space-y-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("description")}
            </p>

            {/* 缓存测试信息 */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg text-sm">
              <p>
                <strong>Render Time:</strong> {renderTime}
              </p>
              <p>
                <strong>Timestamp:</strong> {renderTimestamp}
              </p>
              <p className="text-xs mt-1 text-blue-600 dark:text-blue-400">
                如果这些时间戳在刷新页面时保持不变，说明页面缓存正在工作
                (60秒内)
              </p>
            </div>
          </div>

          {/* Latest Posts */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">{t("latestPosts")}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="font-medium text-sm mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                    {post.body}
                  </p>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                    {t("postId")}: {post.id}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* User Information */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">{t("userInformation")}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <h3 className="font-medium text-sm mb-1">{user.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {user.email}
                  </p>
                  <a
                    href={`https://${user.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {user.website}
                  </a>
                </div>
              ))}
            </div>
          </section>
        </div>

        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            页面已改为服务器端渲染 (SSR){" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              src/app/page.tsx
            </code>
          </li>
          <li className="tracking-[-.01em]">
            数据在服务器端获取并渲染到页面中
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
