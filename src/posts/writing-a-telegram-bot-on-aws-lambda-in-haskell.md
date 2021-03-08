---
title: 'Writing a telegram bot on AWS Lambda in Haskell'
date: 2021-01-29T08:59:52.587Z
tags:
  - post
layout: layouts/post.njk
videoId: GSP2lIAkhLg

---

<!--- You can insert a short description here -->
Many projects these days do not use a traditional backend any more, but have moved their logic to FaaS (Function as a Service) like AWS Lambda.

The core idea is that you don’t have to manage a server, and instead you just upload code and it will be executed on some event. Normally AWS only supports Nodejs, Python and a few more languages for this service. But with custom runtimes, we can deploy any language!

This Tech Weeklies episode shows you how to write a stateless service (in our case a telegram bot) in Haskell and deploy it to AWS Lambda with Terraform.

Presenter: Jan van Brügge
