# Sanity Presentation with GraphQL

> [!IMPORTANT]
> This is the [App Router][app-router] version, [there's also a version for Pages Router](https://github.com/sanity-io/demo-graphql-presentation-nextjs/tree/pages-router#readme).

![Screenshot of Sanity Studio using Presentation Tool to do Visual Editing](https://github.com/sanity-io/next.js/assets/81981/59ecd9d6-7a78-41c6-95f7-275f66fe3c9d)

> [!NOTE]  
> This demo is setup with GraphQL, [there's also a simpler version that uses GROQ.](https://github.com/vercel/next.js/tree/canary/examples/cms-sanity#readme)

## Features

- Uses URQL to query the GraphQL API
- Demonstrates how to use [`sanity/presentation`][presentation] and Visual Editing without GROQ.
- Out of the box support for [Vercel Visual Editing](https://www.sanity.io/blog/visual-editing-sanity-vercel?utm_source=github.com&utm_medium=referral&utm_campaign=may-vercel-launch).

## Demo

### [https://demo-graphql-presentation-nextjs.sanity.build/](https://demo-graphql-presentation-nextjs.sanity.build/)

## Deploy your own

Use the Deploy Button below, you'll deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=next-example).

[![Deploy with Vercel](https://vercel.com/button)][vercel-deploy]

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-next-app --example https://github.com/sanity-io/demo-graphql-presentation-nextjs sanity-graphql-presentation
```

```bash
yarn create next-app --example https://github.com/sanity-io/demo-graphql-presentation-nextjs sanity-graphql-presentation
```

```bash
pnpm create next-app --example https://github.com/sanity-io/demo-graphql-presentation-nextjs sanity-graphql-presentation
```

# Configuration

- [Step 1. Set up the environment](#step-1-set-up-the-environment)
  - [Reuse remote envionment variables](#reuse-remote-envionment-variables)
  - [Using the Sanity CLI](#using-the-sanity-cli)
    - [Creating a read token](#creating-a-read-token)
- [Step 2. Run Next.js locally in development mode](#step-2-run-nextjs-locally-in-development-mode)
- [Step 3. Populate content](#step-3-populate-content)
- [Step 4. Deploy to production](#step-4-deploy-to-production)
- [Next steps](#next-steps)

## Step 1. Set up the environment

### Reuse remote envionment variables

If you started with [deploying your own](#deploy-your-own) then you can run this to reuse the environment variables from the Vercel project and skip to the next step:

```bash
npx vercel link
npx vercel pull
```

### Using the Sanity CLI

Copy the `.env.local.example` file to `.env.local` to get started:

```bash
cp -i .env.local.example .env.local
```

Run the setup command to get setup with a Sanity project, dataset and their relevant environment variables:

```bash
npm run setup
```

```bash
yarn setup
```

```bash
pnpm setup
```

You'll be asked multiple questions, here's a sample output of what you can expect:

```bash
Need to install the following packages:
sanity@3.30.1
Ok to proceed? (y) y
You're setting up a new project!
We'll make sure you have an account with Sanity.io.
Press ctrl + C at any time to quit.

Prefer web interfaces to terminals?
You can also set up best practice Sanity projects with
your favorite frontends on https://www.sanity.io/templates

Looks like you already have a Sanity-account. Sweet!

✔ Fetching existing projects
? Select project to use Templates [r0z1eifg]
? Select dataset to use graphql
? Would you like to add configuration files for a Sanity project in this Next.js folder? No

Detected framework Next.js, using prefix 'NEXT_PUBLIC_'
Found existing NEXT_PUBLIC_SANITY_PROJECT_ID, replacing value.
Found existing NEXT_PUBLIC_SANITY_DATASET, replacing value.
```

It's important that when you're asked `Would you like to add configuration files for a Sanity project in this Next.js folder?` that you answer `No` as this example is alredy setup with the required configuration files.

#### Creating a read token

This far your `.env.local` file should have values for `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`.
Before you can run the project you need to setup a read token (`SANITY_API_READ_TOKEN`), it's used for authentication when Sanity Studio is live previewing your application.

1. Go to [manage.sanity.io](https://manage.sanity.io/) and select your project.
2. Click on the `🔌 API` tab.
3. Click on `+ Add API token`.
4. Name it "next blog live preview read token" and set `Permissions` to `Viewer` and hit `Save`.
5. Copy the token and add it to your `.env.local` file.

```bash
SANITY_API_READ_TOKEN="<paste your token here>"
```

Your `.env.local` file should look something like this:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID="r0z1eifg"
NEXT_PUBLIC_SANITY_DATASET="graphql"
SANITY_API_READ_TOKEN="sk..."
NEXT_PUBLIC_SANITY_GRAPHQL_TAG="default"
```

> [!CAUTION]  
> Make sure to add `.env.local` to your `.gitignore` file so you don't accidentally commit it to your repository.

#### Deploy the GraphQL API

Run this command to deploy the GraphQL API:

```bash
npm run graphql:deploy
```

```bash
yarn graphql:deploy
```

```bash
pnpm graphql:deploy
```

## Step 2. Run Next.js locally in development mode

```bash
npm install && npm run dev
```

```bash
yarn install && yarn dev
```

```bash
pnpm install && pnpm dev
```

Your blog should be up and running on [http://localhost:3000](http://localhost:3000)! If it doesn't work, post on [the Slack community](https://slack.sanity.io/).

## Step 3. Populate content

Open your Sanity Studio that should be running on [http://localhost:3000/studio](http://localhost:3000/studio).

By default you're taken to the [Presentation tool][presentation], which has a preview of the blog on the left hand side, and a list of documents on the right hand side.

<details>
<summary>View screenshot ✨</summary>

![screenshot](https://github.com/vercel/next.js/assets/81981/07cbc580-4a03-4837-9aa4-90b632c95630)

</details>

We're all set to do some content creation!

- Click on the **"+ Create"** button top left and select **Post**
- Type some dummy data for the **Title**
- **Generate** a **Slug**
  <details>
  <summary>Now that you have a slug you should see the post show up in the preview on the left hand side ✨</summary>

  ![screenshot](https://github.com/vercel/next.js/assets/81981/05b74848-6ae4-442b-8995-0b7e2180aa74)

  </details>

- Fill in **Content** with some dummy text
  <details>
  <summary>Or generate it with AI Assist ✨</summary>

  If you've enabled [AI Assist][enable-ai-assist] you click on the sparkles ✨ button and generate a draft based on your title and then on **Generate sample content**.

  ![screenshot](https://github.com/vercel/next.js/assets/81981/2276d8ad-5b55-447c-befe-d53249f091e1)

  </details>

- Summarize the **Content** in the **Excerpt** field
  <details>
  <summary>Or have AI Assist summarize it for you ✨</summary>

  If you've enabled [AI Assist][enable-ai-assist] you click on the sparkles ✨ button and then on **Generate sample content**.

  ![screenshot](https://github.com/vercel/next.js/assets/81981/d24b9b37-cd88-4519-8094-f4c956102450)

  </details>

- Select a **Cover Image** from [Unsplash].
  <details>
  <summary>Unsplash is available in the **Select** dropdown ✨</summary>

  ![screenshot](https://github.com/vercel/next.js/assets/81981/204d004d-9396-434e-8795-a8b68a2ed89b)

  </details>
  <details>
  <summary>Click the "Crop image" button to adjust hotspots and cropping ✨</summary>

  ![screenshot](https://github.com/vercel/next.js/assets/81981/e905fc6e-5bab-46a7-baec-7cb08747772c)

  </details>
  <details>
  <summary>You can preview the results live on the left side, and additional formats on the right side ✨</summary>

  ![screenshot](https://github.com/vercel/next.js/assets/81981/6c59eef0-d2d9-4d77-928a-98e99df4b1df)

  </details>

- Customize the blog name, description and more.
  <details>
  <summary>Click "Structure" at the top center, then on "Settings" on the left hand side ✨</summary>

  ![screenshot](https://github.com/vercel/next.js/assets/81981/14f48d83-af81-4589-900e-a7a598cc608a)

  </details>
  <details>
  <summary>Once you have a "Settings" document, you can customize it inside "Presentation" ✨</summary>

  ![screenshot](https://github.com/vercel/next.js/assets/81981/e3473f7b-5e7e-46ab-8d43-cae54a4b929b)

  </details>

> [!IMPORTANT]  
> For each post record, you need to click **Publish** after saving for it to be visible outside Draft Mode. In production new content is using [Time-based Revalidation](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#time-based-revalidation), which means it may take up to 1 minute before changes show up. Since a stale-while-revalidate pattern is used you may need to refresh a couple of times to see the changes.

## Step 4. Deploy to production

> [!NOTE]  
> If you already [deployed with Vercel earlier](#deploy-your-own) you can skip this step.

To deploy your local project to Vercel, push it to [GitHub](https://docs.github.com/en/get-started/importing-your-projects-to-github/importing-source-code-to-github/adding-locally-hosted-code-to-github)/GitLab/Bitbucket and [import to Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example).

> [!IMPORTANT]  
> When you import your project on Vercel, make sure to click on **Environment Variables** and set them to match your `.env.local` file.

After it's deployed link your local code to the Vercel project:

```bash
npx vercel link
```

> [!TIP]
> In production you can exit Draft Mode by clicking on _"Back to published"_ at the top. On [Preview deployments](https://vercel.com/docs/deployments/preview-deployments) you can [toggle Draft Mode in the Vercel Toolbar](https://vercel.com/docs/workflow-collaboration/draft-mode#enabling-draft-mode-in-the-vercel-toolbar).

## Next steps

- [Join the Sanity community](https://slack.sanity.io/)

[vercel-deploy]: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsanity-io%2Fdemo-graphql-presentation-nextjs&env=NEXT_PUBLIC_SANITY_PROJECT_ID,NEXT_PUBLIC_SANITY_DATASET,SANITY_API_READ_TOKEN,NEXT_PUBLIC_SANITY_GRAPHQL_TAG&envDescription=Make%20sure%20you%27ve%20deployed%20the%20GraphQL%20API%20and%20created%20the%20necessary%20environment%20variables%20before%20deploying&envLink=https%3A%2F%2Fgithub.com%2Fsanity-io%2Fdemo-graphql-presentation-nextjs%23using-the-sanity-cli&project-name=saity-graphql-presentation&repository-name=saity-graphql-presentation&demo-title=Sanity%20Presentation%20%2B%20GQL&demo-description=Using%20URQL%2C%20Next.js%2C%20and%20App%20Router&demo-url=https%3A%2F%2Fdemo-graphql-presentation-nextjs.sanity.build%2F&demo-image=https%3A%2F%2Fgithub.com%2Fsanity-io%2Fnext-sanity%2Fassets%2F81981%2Fb81296a9-1f53-4eec-8948-3cb51aca1259
[`.env.local.example`]: .env.local.example
[unsplash]: https://unsplash.com
[presentation]: https://www.sanity.io/docs/presentation
[enable-ai-assist]: https://www.sanity.io/plugins/ai-assist#enabling-the-ai-assist-api
[app-router]: https://nextjs.org/docs/app
[pages-router]: https://nextjs.org/docs/pages
