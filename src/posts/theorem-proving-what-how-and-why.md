---
title: 'Theorem proving: What, how and why?'
date: 2020-10-09T07:55:42.011Z
tags:
  - post
layout: layouts/post.njk
videoId: goRoo6eVcnU

---

<!--- You can insert a short description here -->
Modern software development means building on existing foundations. You do not need to write your own binary search tree because there is already a library for that. 

But with these foundations being so important, how can we be sure that they are correct? After all, the more projects depend on a library, the worse would be the fallout for bugs, be it a semantic bug where it does not do the right thing or a security bug that might put your user’s data in jeopardy. 

Today’s answer to this problem is testing. But this has flaws. It is simply impossible to show the absence of bugs with tests, as they can only test a finite subset of the possible inputs. This is where theorem proving comes into play. We can verify key properties of our system not only for some inputs, but for all possible inputs.

In this talk I will start with the basics and show how you can get your feet wet with Isabelle/HOL, a theorem proving assistant developed by the Technical University of Munich. I will also show some more involved examples that are more interesting to prove correct. You do not need any knowledge in theorem proving or proving at all, but simple high school math is enough to follow this talk.

Presenter: Jan van Brügge
