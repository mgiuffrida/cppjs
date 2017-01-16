function assert(cond, opt_msg) {
  if (cond)
    return;
  throw new Error(opt_msg || 'Assertion failure!');
}
