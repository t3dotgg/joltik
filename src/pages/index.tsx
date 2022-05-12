import type { NextPage } from "next";
import { useEffect, useState } from "react";
import classNames from "classnames";
import { nanoid } from "nanoid";
import debounce from "lodash/debounce"
import { trpc } from "../../utils/trpc";
import copy from "copy-to-clipboard"

type Form = {
  slug: string;
  url: string;
}

const Home: NextPage = () => {
  const [form, setForm] = useState<Form>({ slug: "", url: "" });
  const [url, setUrl] = useState<string>("");

  useEffect(() => setUrl(window.location.origin), [])

  const slugCheck = trpc.useQuery(['slugCheck', { slug: form.slug }], { enabled: false })
  const createSlug = trpc.useMutation(['createSlug'])

  const main = "flex flex-col justify-center items-center h-screen bg-gray-950 text-white"

  const input = "text-black my-1 p-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-pink-500 block w-full rounded-md sm:text-sm focus:ring-1"

  const slugInput = classNames(input, {
    "border-red-500": slugCheck.isFetched && slugCheck.data!.count > 0,
    "text-red-500": slugCheck.isFetched && slugCheck.data!.count > 0,
  });

  if (createSlug.status === 'success') {
    return (
      <div className={main}>
        <div className="flex justify-center items-center">
          <h1>{`${url}/${form.slug}`}</h1>
          <input
            type="button"
            value="Copy Link"
            className="rounded bg-pink-500 py-1.5 px-1 font-bold cursor-pointer ml-2"
            onClick={() => {
              copy(`${url}/link/${form.slug}`)
            }}
          />
        </div>
        <input
          type="button"
          value="Reset"
          className="rounded bg-pink-500 py-1.5 px-1 font-bold cursor-pointer m-5"
          onClick={() => {
            createSlug.reset()
            setForm({ slug: "", url: "" })
          }}
        />
      </div>
    )
  }

  return (
    <div className={main}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createSlug.mutate({ ...form })
        }}
        className="flex flex-col justify-center h-screen sm:w-2/3 md:w-1/2 lg:w-1/3"
      >
        <div className="flex items-center">
          <span className="font-medium mr-2">{url}/</span>
          <input
            type="text"
            onChange={(e) => {
              setForm({
                ...form,
                slug: e.target.value,
              })
              debounce(slugCheck.refetch, 100)
            }}
            minLength={1}
            placeholder="rothaniel"
            className={slugInput}
            value={form.slug}
            pattern={"^[-a-zA-Z0-9]+$"}
            title="Only alphanumeric characters and hypens are allowed. No spaces."
            required
          />
          <input
            type="button"
            value="Random"
            className="rounded bg-pink-500 py-1.5 px-1 font-bold cursor-pointer ml-2"
            onClick={() => {
              const slug = nanoid()
              setForm({
                ...form,
                slug
              })
              slugCheck.refetch()
            }}
          />
        </div>
        <div className="flex items-center">
          <span className="font-medium mr-2">Link</span>
          <input
            type="url"
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://google.com"
            required
            className={input}
          />
        </div>
        <input
          type="submit"
          value="Create"
          className="rounded bg-pink-500 p-1 font-bold cursor-pointer mt-1"
          disabled={slugCheck.isFetched && slugCheck.data!.count > 0}
        />
      </form>
    </div>
  );
};

export default Home;
